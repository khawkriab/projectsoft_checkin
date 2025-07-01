import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
    Box,
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
import { CheckinCalendar, Profile, UserCheckinList } from 'type.global';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'components/common/FirebaseProvider';
import { getCalendarMonthOfYears } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { getUsersList } from 'components/common/FirebaseProvider/firebaseApi/userApi';
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

function Home() {
    const { profile, authLoading, isSignedIn } = useFirebase();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]);
    const [checkinDataList, setCheckinDataList] = useState<CheckinCalendar[]>([]);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    const [years, setYears] = useState(dayjs().get('years'));

    //
    const getCheckinCalendar = (uList: Profile[], calender: CheckinCalendar[]) => {
        if (uList.length <= 0) return [];

        const m: CheckinDataList[] = calender.map((d) => {
            let checkinData: CheckinDataList['userCheckinList'] = [];
            const isBeforeDay = dayjs(d.date).isBefore(dayjs().add(-1, 'day'));

            uList.forEach((ul) => {
                const userCheckin = d.userCheckinList.find((f) => f?.email === ul.email);

                if (userCheckin) {
                    // time: HH:mm
                    let timeText = userCheckin?.time ? userCheckin.time : '';
                    let remark = userCheckin?.remark ?? '';
                    let statusText = 'ตรงเวลา';
                    let absentFlag = 0;
                    let lateFlag = 0;

                    if (timeText && dayjs(`${d.date} ${timeText}`).isAfter(dayjs(`${d.date} 08:00`))) {
                        statusText = `สาย ${dayjs(`${d.date} ${timeText}`).diff(dayjs(`${d.date} 08:00`), 'minutes')} นาที`;
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
                } else if (isBeforeDay) {
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

    const getCheckin = async (year: number, month: number) => {
        const c = await getCalendarMonthOfYears({ year: year, month: month });
        setCheckinDataList([...c]);
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
            await getCheckin(years, month);
        };

        init();
    }, [years, month]);

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
                                    afterUndate={() => getCheckin(years, month)}
                                />
                                <UserCheckinTodayList
                                    dateList={calendarCheckinAllList as CheckinCalendar[]}
                                    afterUndate={() => getCheckin(years, month)}
                                />
                                <UserAbsentList
                                    dateList={calendarCheckinAllList as CheckinCalendar[]}
                                    afterUndate={() => getCheckin(years, month)}
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

export default Home;
