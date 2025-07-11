import { Alert, Box, Button, Paper, Slide, Snackbar, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFirebase } from 'components/common/FirebaseProvider';
import {
    getCalendarDateOfMonth,
    getCheckinTodayList,
    updateUserCheckin,
    updateUserCheckinCalendar,
} from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import usePageVisibility from 'hooks/usePageVisibility';
import { useEffect, useRef, useState } from 'react';
import { CheckinCalendar, UserCheckInData } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

function UserCheckinTodayList({ dateList, afterUndate }: { dateList: CheckinCalendar[]; afterUndate: () => Promise<void> | void }) {
    const isVisible = usePageVisibility();
    const { profile } = useFirebase();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<UserCheckInData[]>([]);

    const onApprove = async (data: UserCheckInData) => {
        const today = dayjs();
        const cc = dateList.find((f) => f.date === today.format('DD-MM-YYYY'));

        if (cc) {
            setUpdating(true);
            const parseData = dayjs(cc.date, 'DD-MM-YYYY');
            const c = await getCalendarDateOfMonth({ year: parseData.year(), month: parseData.month(), date: parseData.date() });
            await updateUserCheckinCalendar({
                year: today.get('year'),
                month: today.get('month'),
                date: today.get('date'),
                checkinTodayId: data.id,
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                userCheckinList: [
                    ...c.userCheckinList.filter((f) => !!f),
                    {
                        email: data.email,
                        googleId: data.googleId,
                        reason: data.reason,
                        remark: data.remark,
                        time: dayjs(Number(data.time)).format('HH:mm'),
                        approveBy: profile?.name ?? '',
                        approveByGoogleId: profile?.googleId ?? '',
                    },
                ],
            });
            await afterUndate();
            await getCheckinData();
            setUpdating(false);
            setOpen(true);
        }
    };

    const getCheckinData = async () => {
        // get all
        const res = await getCheckinTodayList();

        setCheckinList([...res.filter((f) => f.status === 99 && dayjs(Number(f.time)).isSame(dayjs(), 'day'))]);
    };

    const isTimeBetween = (timeString: string) => {
        // timeString => HH:mm
        const targetTime = dayjs(timeString, 'HH:mm');
        const startTime = dayjs('05:00', 'HH:mm');
        const endTime = dayjs('09:00', 'HH:mm');

        return targetTime.isAfter(startTime) && targetTime.isBefore(endTime);
    };

    useEffect(() => {
        getCheckinData();

        if (isTimeBetween(dayjs().format('HH:mm'))) {
            timer.current = setInterval(() => {
                getCheckinData();
                console.log('getCheckinData');
            }, 30000);
        }

        return () => {
            clearInterval(timer.current);
        };
    }, [isVisible]);
    return (
        <>
            {checkinList.length > 0 && (
                <Box marginTop={2}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadCell>ชื่อ</TableHeadCell>
                                    <TableHeadCell>เวลาเข้างาน</TableHeadCell>
                                    <TableHeadCell>หมายเหตุ</TableHeadCell>
                                    <TableHeadCell>เหตุผล</TableHeadCell>
                                    <TableHeadCell>รายละเอียด</TableHeadCell>
                                    <TableHeadCell>#</TableHeadCell>
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {checkinList.map((c) => (
                                    <TableRow key={c.googleId}>
                                        <TableBodyCell>{c.name}</TableBodyCell>
                                        <TableBodyCell>{dayjs(Number(c.time)).format('DD-MM-YYYY HH:mm')}</TableBodyCell>
                                        <TableBodyCell>{c.remark}</TableBodyCell>
                                        <TableBodyCell>{c.reason}</TableBodyCell>
                                        <TableBodyCell sx={{ whiteSpace: 'break-spaces' }}>
                                            {`${c.device?.osName || c.device?.os}-${c.device?.browserName || c.device?.ua}`}
                                            <br />
                                            {`[${c.latlng.lat},${c.latlng.lng}]`}
                                        </TableBodyCell>
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
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
                    updated successfully
                </Alert>
            </Snackbar>
        </>
    );
}

export default UserCheckinTodayList;
