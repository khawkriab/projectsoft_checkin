import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { getLeaveList, updateLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
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

        const all = datesInRange.map((date) => {
            const checkInCurrentDate = checkInList?.find((tt) => tt.date === date);
            const lpl = getLeavePeriodLabel(absentData?.leavePeriod);
            const ltl = getLeaveType(absentData.leaveType);

            return updateWorkTime(
                {
                    date: date,
                    email: absentData.email,
                    googleId: absentData.googleId,
                    absentId: absentData.id,
                    name: absentData.name,
                    leavePeriod: absentData.leavePeriod,
                    leaveType: absentData.leaveType,
                    reason: absentData.reason ?? checkInCurrentDate?.reason ?? '',
                    time: checkInCurrentDate?.time ?? '',
                    remark: checkInCurrentDate?.remark || `${ltl}-${lpl}`,
                    isWorkOutside: checkInCurrentDate?.isWorkOutside ?? false,
                    approveBy: profile?.name ?? '',
                    approveByGoogleId: profile?.googleId ?? '',
                    status: 1,
                },
                checkInCurrentDate?.id
            );
        });

        setUpdating(true);
        Promise.all(all).then(async () => {
            if (absentData.id) {
                await updateLeave(absentData.id, {
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
