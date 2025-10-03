import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { getAbsentList, updateAbsent } from 'context/FirebaseProvider/firebaseApi/absentApi';
import {
    getUserWorkTime,
    updateUserCheckin,
    updateUserCheckinCalendar,
    updateWorkTime,
} from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';
import { useEffect, useState } from 'react';
import { AbsentData, CalendarDateConfig, CheckinCalendar } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNotification } from 'components/common/NotificationCenter';
import { useFirebase } from 'context/FirebaseProvider';

dayjs.extend(customParseFormat);

function UserAbsentList({ calendar = [], afterUndate }: { calendar: CalendarDateConfig[]; afterUndate: () => Promise<void> | void }) {
    const { openNotify } = useNotification();
    const { profile } = useFirebase();
    const [updating, setUpdating] = useState(false);
    const [absentList, setAbsentList] = useState<AbsentData[]>([]);
    //

    const onApprove = async (absentData: AbsentData) => {
        const startLeave = dayjs(absentData.startDate);
        const endLeave = dayjs(absentData.endDate);

        // list วันทั้งหมดในช่วง
        const datesInRange = Array.from({ length: endLeave.diff(startLeave, 'day') + 1 }, (_, i) =>
            startLeave.add(i, 'day').format('YYYY-MM-DD')
        );

        // แปลง calendar เป็น Map เพื่อหาเร็วขึ้น
        const calendarMap = new Map(calendar.map((entry) => [entry.date, entry]));

        // ตรวจว่าทุกวันมีอยู่ใน calendar
        if (!datesInRange.every((d) => calendarMap.has(d))) {
            return alert('date not match');
        }

        const checkInList = await getUserWorkTime({
            startDate: startLeave.format('YYYY-MM-DD'),
            endDate: endLeave.format('YYYY-MM-DD'),
            email: absentData.email,
        });

        const all = datesInRange.map((d) => {
            const dateOfCalendarConfig = calendarMap.get(d)!;
            const checkInCurrentDate = checkInList?.find((tt) => tt.date === d);

            return updateWorkTime(
                {
                    date: d,
                    email: absentData.email,
                    googleId: absentData.googleId,
                    name: absentData.name,
                    time: checkInCurrentDate?.time ?? '',
                    reason: absentData.reason ?? checkInCurrentDate?.reason,
                    remark: checkInCurrentDate?.remark ?? '',
                    approveBy: profile?.name ?? '',
                    approveByGoogleId: profile?.googleId ?? '',
                    leavePeriod: absentData.leavePeriod,
                    absentId: absentData.id ?? null,
                    isWFH: dateOfCalendarConfig?.isWFH ?? false,
                },
                checkInCurrentDate?.id,
                undefined
            );
        });
        // const output = {
        //     date: '2025-10-03',
        //     isHalfDay: false,
        //     entryTime: '08:30',
        //     isWFH: false,
        //     isOffDay: false,
        // }[];

        // let currentDate = startLeave;
        // // add all date in range to array
        // while (currentDate.isBefore(endLeave) || currentDate.isSame(endLeave)) {
        //     datesInRange.push(currentDate.format('DD-MM-YYYY'));
        //     currentDate = currentDate.add(1, 'day');
        // }

        // // check has date in calendar
        // const datesToCheckSet = new Set(calendar.map((entry) => entry.date)); // return set of date string in DD-MM-YYYY
        // const isRangeInDates = datesInRange.every((date) => datesToCheckSet.has(date));

        // if (!isRangeInDates) return alert('date not match');

        // const all = datesInRange.map((d) => {
        //     // DD-MM-YYYY
        //     const cd = calendar.find((f) => f.date === d);

        //             const payload: UserCheckInDate = {
        //                 date: parseData.format('YYYY-MM-DD'),
        //                 email: data.email,
        //                 googleId: data.googleId,
        //                 name: data.name,
        //                 time: dayjs(Number(data.time)).format('HH:mm'),
        //                 reason: data.reason,
        //                 remark: data.remark,
        //                 approveBy: profile?.name ?? '',
        //                 approveByGoogleId: profile?.googleId ?? '',
        //                 leavePeriod: t?.leavePeriod ?? null,
        //                 absentId: t?.absentId ?? null,
        //                 isWFH: data?.remark?.toLowerCase().includes('wfh') ?? false,
        //             };

        //             try {
        //                 await updateWorkTime(payload, t?.id, data.id);
        //                 await afterUndate();
        //             } catch (error) {
        //                 console.error('error:', error);
        //             }

        // if (cd && cd?.id) {
        //     const userCheckinList = cd.userCheckinList.filter((f) => f && f.email !== data.email);

        //     const rd = dayjs(d, 'DD-MM-YYYY');
        //     return updateUserCheckinCalendar({
        //         year: rd.get('year'),
        //         month: rd.get('month'),
        //         date: rd.get('date'),
        //         userCheckinList: [
        //             ...userCheckinList.filter((f) => !!f),
        //             {
        //                 remark: `${getLeaveType(data.leaveType)} - ${getLeavePeriodLabel(data.leavePeriod)}`,
        //                 time: '',
        //                 email: data?.email,
        //                 googleId: data?.googleId ?? '',
        //                 reason: data?.reason ?? '',
        //                 approveBy: profile?.name ?? '',
        //                 approveByGoogleId: profile?.googleId ?? '',
        //             },
        //         ],
        //     });
        // }
        // });

        setUpdating(true);
        Promise.all(all).then(async () => {
            if (absentData.id) {
                await updateAbsent(absentData.id, {
                    status: 'APPROVE',
                    approveBy: profile?.name ?? '',
                    approveByGoogleId: profile?.googleId ?? '',
                });
            }

            await getAbsentData();
            afterUndate();
            setUpdating(false);
            openNotify('success', 'update success');
        });
    };

    const getAbsentData = async () => {
        // get all
        const res = await getAbsentList('WAITING');
        setAbsentList([...res]);

        // setCheckinList([...res.filter((f) => f.status === 99 && dayjs(Number(f.time)).isSame(dayjs(), 'day'))]);
    };
    useEffect(() => {
        getAbsentData();
    }, []);
    //
    return (
        <>
            {absentList.length > 0 && (
                <Box marginTop={2}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadCell>ชื่อ</TableHeadCell>
                                    <TableHeadCell>วันลา</TableHeadCell>
                                    <TableHeadCell>การลา</TableHeadCell>
                                    <TableHeadCell>รายละเอียด</TableHeadCell>
                                    <TableHeadCell>#</TableHeadCell>
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {absentList.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableBodyCell>{c.name}</TableBodyCell>
                                        <TableBodyCell>{`${dayjs(c.startDate).format('DD/MM/YYYY')} - ${dayjs(c.endDate).format(
                                            'DD/MM/YYYY'
                                        )}`}</TableBodyCell>
                                        <TableBodyCell>{`${getLeaveType(c.leaveType)} - ${getLeavePeriodLabel(
                                            c.leavePeriod
                                        )}`}</TableBodyCell>
                                        <TableBodyCell sx={{ whiteSpace: 'break-spaces' }}>{c.reason}</TableBodyCell>
                                        <TableBodyCell>
                                            <Button
                                                size='small'
                                                loading={updating}
                                                variant='contained'
                                                color='warning'
                                                onClick={() => onApprove(c)}
                                            >
                                                อนุมัติ
                                            </Button>
                                        </TableBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </>
    );
}

export default UserAbsentList;
