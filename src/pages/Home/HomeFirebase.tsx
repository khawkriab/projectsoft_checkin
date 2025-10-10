import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, MenuItem, Paper, Select, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import {
    CalendarDateConfig,
    CalendarDateList,
    CheckinCalendar,
    CheckinDate,
    LeavePeriodsType,
    Profile,
    UserCheckInDate,
    UserCheckinList,
} from 'type.global';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'context/FirebaseProvider';
import { getCalendarConfig, getCalendarMonthOfYears, getWorkTimeList } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { getUsersList, getUsersListWithMonth } from 'context/FirebaseProvider/firebaseApi/userApi';
import { UserCheckinTodayForm } from 'components/UserCheckinTodayForm';
import { UserCheckinTodayList } from 'components/UserCheckinTodayList';
import { UserAbsentList } from 'components/UserAbsentList';
import { UserSelfCheckIn } from 'components/UserSelfCheckIn';
import { FilterCheckinUser } from 'components/common/FilterCheckinUser';
import { getLeaveList } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

type ExtendText = UserCheckInDate & { statusText: string; lateFlag: number; timeText: string };

export type CalendarDateExtendText = Omit<CalendarDateList, 'userCheckinList'> & {
    userCheckinList: ((CheckinDate & { statusText: string; lateFlag: number; timeText: string }) | null)[];
};

function Home() {
    const { profile, authLoading, isSignedIn } = useFirebase();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    const [years, setYears] = useState(dayjs().get('years'));
    const [calendarConfig, setCalendarConfig] = useState<CalendarDateConfig[]>([]);
    // re-new
    const [checkinDataList, setCheckinDataList] = useState<CalendarDateList[]>([]);

    //
    const getCheckinCalendar = (uList: Profile[], calender: CalendarDateList[]) => {
        if (uList.length <= 0) return [];

        const m: CalendarDateExtendText[] = calender.map((calendarDate) => {
            let checkinData: CalendarDateExtendText['userCheckinList'] = [];
            const isBeforeDay = dayjs(calendarDate.date).isBefore(dayjs().add(-1, 'day'));

            uList.forEach((ul) => {
                const userCheckin = calendarDate.userCheckinList.find((f) => f?.email === ul.email);
                const startWork = dayjs(ul.employmentStartDate).isAfter(calendarDate.date);

                if (userCheckin) {
                    // time: HH:mm
                    let timeText = userCheckin?.time || '';
                    let remark =
                        userCheckin.isWorkOutside && !userCheckin?.remark?.toLowerCase().includes('wfh')
                            ? 'WFH'
                            : userCheckin?.remark || '';
                    let reason = userCheckin?.reason ?? '';
                    let statusText = 'ตรงเวลา';
                    let lateFlag = 0;
                    const lpl = userCheckin?.leavePeriod ? getLeavePeriodLabel(userCheckin?.leavePeriod) : '';
                    const ltl = userCheckin?.leaveType ? getLeaveType(userCheckin.leaveType) : '';
                    const wfhText = userCheckin?.isWorkOutside ? 'WFH' : '';

                    if (remark.includes('ลา') || userCheckin?.absentId) {
                        statusText = `${remark} ${wfhText} ${lpl && `${lpl}-${ltl}`}`;
                        reason = `${userCheckin?.reason}`;
                    } else if (
                        timeText &&
                        dayjs(`${calendarDate.date} ${timeText}`).isAfter(dayjs(`${calendarDate.date} ${calendarDate.entryTime}`))
                    ) {
                        statusText = `สาย ${dayjs(`${calendarDate.date} ${timeText}`).diff(
                            dayjs(`${calendarDate.date} ${calendarDate.entryTime}`),
                            'minutes'
                        )} นาที`;
                        lateFlag = 1;
                    } else if (!remark && !timeText && isBeforeDay) {
                        statusText = 'หาย';
                        lateFlag = 1;
                    }
                    checkinData.push({ ...userCheckin, statusText, lateFlag, timeText, reason });
                } else if (isBeforeDay && !startWork) {
                    checkinData.push({
                        name: ul.name,
                        email: ul.email,
                        googleId: ul.googleId,
                        statusText: 'หาย',
                        status: 0,
                        approveBy: '',
                        approveByGoogleId: '',
                        date: calendarDate.date,
                        lateFlag: 0,
                        timeText: '',
                    });
                } else {
                    checkinData.push(null);
                }
            });

            return {
                ...calendarDate,
                userCheckinList: checkinData,
            };
        });

        return m;
    };

    const calendarCheckin = useMemo(() => {
        if (userFilterList.length <= 0) return [];

        const m = getCheckinCalendar(userFilterList, checkinDataList);

        return m.sort((a, b) => a.date.localeCompare(b.date));
    }, [JSON.stringify(checkinDataList), JSON.stringify(userFilterList)]);

    const calendarCheckinAllList = useMemo(() => {
        if (userList.length <= 0) return [];

        const m = getCheckinCalendar(userList, checkinDataList);

        return m.sort((a, b) => a.date.localeCompare(b.date));
    }, [JSON.stringify(checkinDataList), JSON.stringify(userList)]);

    const getCheckin = async (year: number, month: number, calendarDateConfig: CalendarDateConfig[]) => {
        const parseDate = dayjs(`${year}-${month + 1}-1`, 'YYYY-M-D');
        const workTimeList = await getWorkTimeList({
            startDateString: parseDate.format('YYYY-MM-DD'),
            endDateString: parseDate.endOf('month').format('YYYY-MM-DD'),
        });
        const n = groupByDate(
            workTimeList.filter((f) => f.status !== 99),
            calendarDateConfig
        );
        setCheckinDataList([...n]);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const res = await getUsersListWithMonth({ today: dayjs(`${years}-${month + 1}-01`).format('YYYY-MM-DD') });
            const u = res.filter((f) => f.jobPosition !== 'CEO');
            setUserList([...u]);

            const c = await getCalendarConfig({ id: `${years}-${month + 1}` });
            setCalendarConfig(c);

            await getCheckin(years, month, c);

            setLoading(false);
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
                        {/* <Box>
                            <Button
                                loading={loading}
                                variant='contained'
                                sx={{ marginRight: 2 }}
                                onClick={() => onConvertToGoogleCalendar(years, month)}
                            >
                                convert to google calendar
                            </Button>
                        </Box> */}
                        {profile?.googleId && (
                            <UserSelfCheckIn
                                // defaultWfh
                                defaultWfh={!!calendarConfig.find((f) => f.date === dayjs().format('YYYY-MM-DD'))?.isCanWorkOutside}
                            />
                        )}
                        {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                            <>
                                <UserCheckinTodayForm
                                    dateList={calendarCheckinAllList}
                                    userList={userList}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                                <UserCheckinTodayList
                                    dateList={calendarCheckinAllList}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                                <UserAbsentList calendar={calendarConfig} afterUndate={() => getCheckin(years, month, calendarConfig)} />
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
                    <CalendarTable userFilterList={userFilterList} calendarCheckin={calendarCheckin} />
                </>
            )}
        </div>
    );
}

function CalendarTable({ userFilterList, calendarCheckin }: { userFilterList: Profile[]; calendarCheckin: CalendarDateExtendText[] }) {
    return (
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
                                            {u?.remark && u?.timeText && ' - '}
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
                                                backgroundColor: u?.lateFlag ? '#f00' : u?.absentId ? '#ff6f00' : '',
                                                color: u?.lateFlag || u?.absentId ? '#ffffff' : '',
                                                textAlign: u?.lateFlag || u?.absentId ? 'center' : '',
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
    );
}

// Utility function to group array by date
function groupByDate(userCheckInDate: CheckinDate[], dateConfig: CalendarDateConfig[]) {
    const grouped: Record<string, CheckinDate[]> = {};

    userCheckInDate.forEach((data) => {
        if (!grouped[data.date]) grouped[data.date] = [];
        grouped[data.date].push(data);
    });

    const arr: CalendarDateList[] = dateConfig.map((cfg) => ({
        ...cfg,
        userCheckinList: grouped[cfg.date] ?? [],
    }));

    // convert for old data structure
    // const arr = dateConfig.map((cfg) => ({
    //     ...cfg,
    //     id: cfg.date,
    //     wfhFlag: cfg.isWorkOutside ? 1 : 0,

    //     userCheckinList: grouped[cfg.date] ?? [],
    // }));

    return arr;
}

export default Home;
