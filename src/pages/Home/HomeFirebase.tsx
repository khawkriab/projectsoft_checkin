import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
    Box,
    Button,
    FormControl,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { CalendarDateConfig, CheckinCalendar, Profile, UserCheckInDate, UserCheckinList } from 'type.global';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'context/FirebaseProvider';
import {
    getCalendarConfig,
    getCalendarMonthOfYears,
    getWorkTimeList,
    updateWorkTime,
} from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { getUsersList } from 'context/FirebaseProvider/firebaseApi/userApi';
import { UserCheckinTodayForm } from 'components/UserCheckinTodayForm';
import { UserCheckinTodayList } from 'components/UserCheckinTodayList';
import { UserAbsentList } from 'components/UserAbsentList';
import { UserSelfCheckIn } from 'components/UserSelfCheckIn';
import { FilterCheckinUser } from 'components/common/FilterCheckinUser';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export type CheckinDataList = Omit<CheckinCalendar, 'userCheckinList'> & {
    userCheckinList: (
        | (UserCheckinList & Profile & { statusText: string; absentFlag: number; lateFlag: number; timeText: string })
        | null
    )[];
};

type CheckinCalendarExtend = CheckinCalendar & Pick<CalendarDateConfig, 'isWFH' | 'entryTime'>;

function Home() {
    const { profile, authLoading, isSignedIn } = useFirebase();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]);
    const [checkinDataList, setCheckinDataList] = useState<CheckinCalendarExtend[]>([]);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    const [years, setYears] = useState(dayjs().get('years'));
    const [convertData, setConvertData] = useState<UserCheckInDate[]>([]); // debug
    const [calendarConfig, setCalendarConfig] = useState<CalendarDateConfig[]>([]);

    //
    const getCheckinCalendar = (uList: Profile[], calender: CheckinCalendarExtend[]) => {
        if (uList.length <= 0) return [];

        const m: CheckinDataList[] = calender.map((d) => {
            let checkinData: CheckinDataList['userCheckinList'] = [];
            const isBeforeDay = dayjs(d.date).isBefore(dayjs().add(-1, 'day'));

            uList.forEach((ul) => {
                const userCheckin = d.userCheckinList.find((f) => f?.email === ul.email);
                const startWork = dayjs(ul.createdAt).isAfter(d.date);

                if (userCheckin) {
                    // time: HH:mm
                    let timeText = userCheckin?.time ? userCheckin.time : '';
                    let remark = userCheckin?.remark ?? '';
                    let statusText = 'ตรงเวลา';
                    let absentFlag = 0;
                    let lateFlag = 0;

                    if (timeText && dayjs(`${d.date} ${timeText}`).isAfter(dayjs(`${d.date} ${d.entryTime}`))) {
                        statusText = `สาย ${dayjs(`${d.date} ${timeText}`).diff(dayjs(`${d.date} ${d.entryTime}`), 'minutes')} นาที`;
                        lateFlag = 1;
                    } else if (!timeText && remark.includes('ลา')) {
                        statusText = remark;
                        remark = 'ลา';
                        absentFlag = 1;
                    } else if (!remark && !timeText && isBeforeDay) {
                        statusText = 'หาย';
                        lateFlag = 1;
                    }
                    checkinData.push({ ...ul, ...userCheckin, statusText, absentFlag, lateFlag, timeText });
                } else if (isBeforeDay && !startWork) {
                    checkinData.push({
                        ...ul,
                        email: ul.email,
                        googleId: ul.googleId,
                        statusText: 'หาย',
                        absentFlag: 0,
                        lateFlag: 1,
                        timeText: '',
                        remark: '',
                        reason: '',
                        time: '',
                        approveBy: '',
                        approveByGoogleId: '',
                    });
                } else {
                    checkinData.push(null);
                }
            });

            return {
                id: d.id,
                date: dayjs(d.date).format('DD-MM-YYYY'),
                wfhFlag: d.wfhFlag,
                userCheckinList: checkinData,
            };
        });

        return m;
    };

    const calendarCheckin = useMemo(() => {
        if (userFilterList.length <= 0) return [];

        const m = getCheckinCalendar(userFilterList, checkinDataList);

        return m;

        // const fl = userFilterList.map((m) => m.email);
        // return checkinDataList.filter((f) => f.userCheckinList.some((s) => s?.email && fl.includes(s?.email)));
    }, [JSON.stringify(checkinDataList), JSON.stringify(userFilterList)]);

    const calendarCheckinAllList = useMemo(() => {
        if (userList.length <= 0) return [];

        const m = getCheckinCalendar(userList, checkinDataList);

        return m;

        // const fl = userFilterList.map((m) => m.email);
        // return checkinDataList.filter((f) => f.userCheckinList.some((s) => s?.email && fl.includes(s?.email)));
    }, [JSON.stringify(checkinDataList), JSON.stringify(userList)]);

    const getCheckin = async (year: number, month: number, ul: CalendarDateConfig[]) => {
        // const c = await getCalendarMonthOfYears({ year: year, month: month });
        // setCheckinDataList([...c]);
        const d = dayjs(`${year}-${month + 1}-1`, 'YYYY-M-D');
        const c = await getWorkTimeList({ startDateString: d.format('YYYY-MM-DD'), endDateString: d.endOf('month').format('YYYY-MM-DD') });
        const x = groupByDate(c, ul || []);
        const n: CheckinCalendarExtend[] = x.map((item) => ({
            id: item.date,
            ...item,
            date: item.date,
            wfhFlag: item.isWFH ? 1 : 0,
            userCheckinList: item.workTimeList.map((wt) => ({
                remark: wt?.remark ?? '',
                time: wt?.time ?? '',
                email: wt?.email,
                googleId: wt?.googleId ?? '',
                reason: wt?.reason ?? '',
                approveBy: wt?.approveBy ?? '',
                approveByGoogleId: wt?.approveByGoogleId ?? '',
            })),
        }));
        setCheckinDataList([...n]);
    };

    useEffect(() => {
        const init = async () => {
            const res = await getUsersList();

            const u = res.filter((f) => f.status !== 'INACTIVE' && f.jobPosition !== 'CEO');
            setUserList([...u]);
            setLoading(false);
        };

        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            // const res = await getUsersList();
            const c = await getCalendarConfig({ id: `${years}-${month + 1}` });
            setCalendarConfig(c.data);

            // const u = res.filter((f) => f.status !== 'INACTIVE' && f.jobPosition !== 'CEO');
            await getCheckin(years, month, c.data);
        };

        init();
    }, [years, month]);
    // useEffect(() => {
    //     const init = async () => {
    //         await getCheckin(years, month);
    //     };

    //     init();
    // }, [years, month]);

    const onConvertToGoogleCalendar = () => {
        try {
            setLoading(true);
            const all = convertData.map((d) => updateWorkTime(d));
            Promise.all(all).then(() => {
                alert('convert success');
                setLoading(false);
            });
        } catch (error) {
            console.error('error:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* <LocationChecker /> */}

            {authLoading ? (
                <div>Loading...</div>
            ) : (
                isSignedIn && (
                    <Box sx={{ marginBottom: 4 }}>
                        {/* <Box>
                            <Button loading={loading} variant='contained' sx={{ marginRight: 2 }} onClick={onConvertToGoogleCalendar}>
                                convert to google calendar
                            </Button>
                        </Box> */}
                        {profile?.googleId && (
                            <UserSelfCheckIn
                                defaultWfh={!!checkinDataList.find((f) => f.id === String(dayjs().get('date')))?.wfhFlag}
                                checkinToday={calendarCheckinAllList.find((f) => f.date === dayjs().format('DD-MM-YYYY'))}
                            />
                        )}
                        {/* {profile?.email && process.env.REACT_APP_ENV === 'test' && (
                                <UserSelfCheckIn checkinToday={checkinDataList.find((f) => f.date === dayjs().format('DD-MM-YYYY'))} />
                            )} */}
                        {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                            <>
                                <UserCheckinTodayForm
                                    dateList={calendarCheckinAllList as CheckinCalendar[]}
                                    userList={userList}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                                <UserCheckinTodayList
                                    dateList={calendarCheckinAllList as CheckinCalendar[]}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                                <UserAbsentList
                                    dateList={calendarCheckinAllList as CheckinCalendar[]}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                            </>
                        )}
                    </Box>
                )
            )}

            {!loading && (
                <>
                    <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} justifyContent={'space-between'} marginBottom={2} gap={2}>
                        <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} gap={2}>
                            <Typography variant='h5'>ตารางเช็คชื่อเข้างานประจำเดือน </Typography>
                            {profile?.role === 'ADMIN' ? (
                                <Box display={'flex'} flex={'auto'} gap={2}>
                                    <Select
                                        name='month'
                                        value={month}
                                        onChange={(e) => {
                                            setMonth(e.target.value);
                                        }}
                                    >
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <MenuItem key={i} value={i}>
                                                {dayjs().month(i).format('MMMM')}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Select
                                        name='email'
                                        value={years}
                                        onChange={(e) => {
                                            setYears(e.target.value);
                                        }}
                                    >
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <MenuItem key={i} value={dayjs().year() - i}>
                                                {dayjs().year() - i}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                            ) : (
                                <Typography variant='h5'>{dayjs().format('MMMM YYYY')}</Typography>
                            )}
                        </Box>
                        <FilterCheckinUser userList={userList} onChangeFilter={(values) => setUserFilterList([...values])} />
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'ชื่อพนักงาน'}</TableHeadCell>
                                    {userFilterList.map((user, index) => {
                                        return (
                                            <TableHeadCell key={index} colSpan={2} align='center' sx={{ borderLeft: '1px solid #fff' }}>
                                                {user.name}
                                            </TableHeadCell>
                                        );
                                    })}
                                </TableHeadRow>
                                <TableHeadRow>
                                    <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'วันที่'}</TableHeadCell>
                                    {userFilterList.map((_, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'เวลาเข้าทำงาน'}</TableHeadCell>
                                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'สถานะ'}</TableHeadCell>
                                            </React.Fragment>
                                        );
                                    })}
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {calendarCheckin.map((row, rowIdx) => (
                                    <TableRow key={rowIdx}>
                                        <TableBodyCell
                                            sx={(theme) => ({
                                                border: '1px solid',
                                                borderLeftColor: theme.palette.secondary.contrastText,
                                            })}
                                        >
                                            {row.date}
                                        </TableBodyCell>
                                        {row.userCheckinList.map((u, uIndex) => (
                                            <React.Fragment key={`${uIndex}-${u?.name}`}>
                                                {/* เวลาเข้าทำงาน */}
                                                <TableBodyCell
                                                    sx={(theme) => ({
                                                        border: '1px solid',
                                                        borderLeftColor: theme.palette.secondary.contrastText,
                                                    })}
                                                >
                                                    {u?.timeText}
                                                    <Box display={'inline-block'} color={'#ff6f00'} fontWeight={700}>
                                                        {u?.timeText && u?.remark && ' - '}
                                                        {u?.remark}
                                                    </Box>
                                                </TableBodyCell>
                                                {/* สถานะ */}
                                                <TableBodyCell
                                                    sx={(theme) => ({
                                                        border: '1px solid',
                                                        borderLeftColor: theme.palette.secondary.contrastText,
                                                    })}
                                                >
                                                    <Box
                                                        sx={{
                                                            padding: '2px 4px',
                                                            borderRadius: 1,
                                                            backgroundColor: u?.lateFlag ? '#f00' : u?.absentFlag ? '#ff6f00' : '',
                                                            color: u?.lateFlag || u?.absentFlag ? '#ffffff' : '',
                                                            textAlign: u?.lateFlag || u?.absentFlag ? 'center' : '',
                                                        }}
                                                    >
                                                        {u?.statusText}
                                                    </Box>
                                                    <Box>{u?.reason}</Box>
                                                </TableBodyCell>
                                            </React.Fragment>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </div>
    );
}

// Utility function to group array by date
function groupByDate<T extends { date: string }>(arr: T[], dateConfig: CalendarDateConfig[]) {
    const map = new Map<string, T[]>();
    arr.forEach((item) => {
        if (!map.has(item.date)) map.set(item.date, []);
        map.get(item.date)!.push(item);
    });
    // Map over dateConfig to ensure all config dates are included, even if no workTimeList
    return dateConfig.map((cfg) => ({
        ...cfg,
        workTimeList: map.get(cfg.date) ?? [],
    }));
}

// Example usage with your data:
// const data = [ { ...your object... } ];
// const grouped = groupByDate(data);
// Result: { "2025-09-01": [ { ... } ] }

export default Home;
