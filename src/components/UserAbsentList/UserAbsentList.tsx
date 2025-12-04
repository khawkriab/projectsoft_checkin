import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { getLeaveList, updateLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { getCalendarConfig, getUserWorkTime, updateUserCheckin, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';
import { useEffect, useState } from 'react';
import { LeaveData, CalendarDateConfig, CheckinCalendar } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNotification } from 'components/common/NotificationCenter';
import { useFirebase } from 'context/FirebaseProvider';

dayjs.extend(customParseFormat);

function UserAbsentList({ calendar = [], afterUndate }: { calendar: CalendarDateConfig[]; afterUndate: () => Promise<void> | void }) {
    const { openNotify } = useNotification();
    const { profile } = useFirebase();
    const [updating, setUpdating] = useState(false);
    const [absentList, setAbsentList] = useState<LeaveData[]>([]);
    //

    const onApprove = async (absentData: LeaveData) => {
        console.log('absentData:', absentData);
        const startLeave = dayjs(absentData.startDate);
        const endLeave = dayjs(absentData.endDate);

        // list วันทั้งหมดในช่วง
        const datesInRange = Array.from({ length: endLeave.diff(startLeave, 'day') + 1 }, (_, i) =>
            startLeave.add(i, 'day').format('YYYY-MM-DD')
        );

        // แปลง calendar เป็น Map เพื่อหาเร็วขึ้น
        const calendarConfig = await getCalendarConfig(`${startLeave.year()}-${startLeave.month() + 1}`);

        if (calendarConfig.length <= 0) {
            return alert('not calendar config');
        }
        const calendarMap = new Map(calendarConfig.map((entry) => [entry.date, entry]));
        console.log('calendarMap:', calendarMap);

        // ตรวจว่าทุกวันมีอยู่ใน calendar
        // if (!datesInRange.every((d) => calendarMap.has(d))) {
        //     return alert('date not match');
        // }

        const checkInList = await getUserWorkTime({
            startDate: startLeave.format('YYYY-MM-DD'),
            endDate: endLeave.format('YYYY-MM-DD'),
            suid: absentData.suid,
        });
        console.log('checkInList:', checkInList);

        const all: Promise<string>[] = [];

        calendarMap.forEach((m) => {
            const checkInCurrentDate = checkInList?.find((f) => f.date === m.date);

            all.push(
                updateWorkTime(
                    {
                        date: m.date,
                        email: absentData.email,
                        suid: absentData.suid,
                        absentId: absentData.id,
                        name: absentData.name,
                        leavePeriod: absentData.leavePeriod,
                        leaveType: absentData.leaveType,
                        reason: absentData.reason ?? checkInCurrentDate?.reason ?? '',
                        time: checkInCurrentDate?.time ?? '',
                        remark: checkInCurrentDate?.remark || '',
                        isWorkOutside: checkInCurrentDate?.isWorkOutside ?? false,
                        approveBy: profile?.name ?? '',
                        approveBySuid: profile?.suid ?? '',
                        status: 1,
                    },
                    checkInCurrentDate?.id
                )
            );
        });

        // setUpdating(true);
        console.log('all:', all);
        Promise.all(all).then(async () => {
            if (absentData.id) {
                await updateLeave(absentData.id, {
                    status: 'APPROVE',
                    approveBy: profile?.name ?? '',
                    approveBySuid: profile?.suid ?? '',
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
        const res = await getLeaveList('WAITING');
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
