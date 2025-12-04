import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, MenuItem, Paper, Select, Typography } from '@mui/material';
import { CalendarDateConfig, CalendarDateList, Profile } from 'type.global';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'context/FirebaseProvider';
import { getCalendarConfig, getWorkTimeList } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { getUsersListWithMonth } from 'context/FirebaseProvider/firebaseApi/userApi';
import { UserCheckinTodayForm } from 'components/UserCheckinTodayForm';
import { UserCheckinTodayList } from 'components/UserCheckinTodayList';
import { UserAbsentList } from 'components/UserAbsentList';
import { FilterCheckinUser } from 'components/common/FilterCheckinUser';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';
import CalendarTable, { CalendarDateExtendText } from './component/CalendarTable';
import { groupByDate } from './util/groupByDate';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

function Home() {
    const { profile, authLoading, isSignedIn } = useFirebase();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    // const [month, setMonth] = useState(3); // 0-11
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
                const userCheckin = calendarDate.userCheckinList.find((f) => f?.suid === ul.suid);
                // employee start work
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
                        if (remark.includes('ลา') && !userCheckin?.absentId) {
                            statusText += ' no absentId';
                        }
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
                        statusText = 'null';
                        lateFlag = 2;
                    }
                    checkinData.push({ ...userCheckin, statusText, lateFlag, timeText, reason });
                } else if (isBeforeDay && !startWork) {
                    checkinData.push({
                        name: ul.name,
                        email: ul.email,
                        suid: ul.suid,
                        statusText: 'หาย',
                        status: 0,
                        approveBy: '',
                        approveBySuid: '',
                        date: calendarDate.date,
                        lateFlag: 2,
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
        const workTimesList = await getWorkTimeList({
            startDateString: parseDate.format('YYYY-MM-DD'),
            endDateString: parseDate.endOf('month').format('YYYY-MM-DD'),
        });
        // console.log('workTimesList:', workTimesList);
        const allGroup = groupByDate(
            workTimesList.filter((f) => f.status !== 99),
            calendarDateConfig
        );

        setCheckinDataList([...allGroup]);
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const res = await getUsersListWithMonth({
                today: dayjs(`${years}-${month + 1}-01`).format('YYYY-MM-DD'),
            });
            const u = res.filter((f) => f.jobPosition !== 'CEO');
            setUserList([...u]);

            const c = await getCalendarConfig(`${years}-${month + 1}`);
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
                        {(profile?.role === 'ORGANIZATION' || profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                            <>
                                <UserCheckinTodayForm
                                    dateList={calendarCheckinAllList}
                                    userList={userList}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                                <UserCheckinTodayList
                                    dateList={calendarCheckinAllList}
                                    todayConfig={calendarConfig.find((f) => dayjs(Number(f.date)).isSame(dayjs(), 'day'))}
                                    afterUndate={() => getCheckin(years, month, calendarConfig)}
                                />
                            </>
                        )}
                        {(profile?.role === 'ORGANIZATION' || profile?.role === 'ADMIN') && (
                            <UserAbsentList calendar={calendarConfig} afterUndate={() => getCheckin(years, month, calendarConfig)} />
                        )}
                    </Box>
                )
            )}

            {!loading && (
                <>
                    <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} justifyContent={'space-between'} marginBottom={2} gap={2}>
                        <Box display={'flex'} flexWrap={'wrap'} alignItems={'center'} gap={2}>
                            <Typography variant='h5'>ตารางเช็คชื่อเข้างานประจำเดือน </Typography>
                            {profile?.role === 'ADMIN' || profile?.role === 'ORGANIZATION' ? (
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
                                        name='years'
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

export default Home;
