import { Alert, Box, Button, Paper, Slide, Snackbar, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import {
    getCheckinTodayList,
    getUserWorkTime,
    getWorkTimeListWithStatus,
    updateWorkTime,
} from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import usePageVisibility from 'hooks/usePageVisibility';
import { useEffect, useRef, useState } from 'react';
import { CheckinDate } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CalendarDateExtendText } from 'pages/Home/HomeFirebase';

dayjs.extend(customParseFormat);

function UserCheckinTodayList({ dateList, afterUndate }: { dateList: CalendarDateExtendText[]; afterUndate: () => Promise<void> | void }) {
    const isVisible = usePageVisibility();
    const { profile } = useFirebase();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<CheckinDate[]>([]);

    const onApprove = async (data: CheckinDate) => {
        const today = dayjs();
        const cc = dateList.find((f) => f.date === today.format('YYYY-MM-DD'));

        if (cc) {
            setUpdating(true);
            const parseData = dayjs(cc.date);
            const res = await getUserWorkTime({ startDate: parseData.format('YYYY-MM-DD'), email: data.email });
            console.log('res:', res);

            const payload: CheckinDate = {
                ...data,
                device: null,
                latlng: null,
                status: 1,
                // date: parseData.format('YYYY-MM-DD'),
                // email: data.email,
                // googleId: data.googleId,
                // name: data.name,
                // time: dayjs(Number(data.time)).format('HH:mm'),
                // reason: data.reason,
                // remark: data.remark,
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                // leavePeriod: res?.leavePeriod ||undefined,
                // absentId: res?.absentId ||undefined,
                // isWFH: data?.remark?.toLowerCase().includes('wfh') ?? false,
            };

            try {
                await updateWorkTime(payload, res?.id);
                await afterUndate();
            } catch (error) {
                console.error('error:', error);
            }

            // const c = await getCalendarDateOfMonth({ year: parseData.year(), month: parseData.month(), date: parseData.date() });
            // await updateUserCheckinCalendar({
            //     year: today.get('year'),
            //     month: today.get('month'),
            //     date: today.get('date'),
            //     checkinTodayId: data.id,
            //     approveBy: profile?.name ?? '',
            //     approveByGoogleId: profile?.googleId ?? '',
            //     userCheckinList: [
            //         ...c.userCheckinList.filter((f) => !!f),
            //         {
            //             email: data.email,
            //             googleId: data.googleId,
            //             reason: data.reason,
            //             remark: data.remark,
            //             time: dayjs(Number(data.time)).format('HH:mm'),
            //             approveBy: profile?.name ?? '',
            //             approveByGoogleId: profile?.googleId ?? '',
            //         },
            //     ],
            // });
            await afterUndate();
            await getCheckinData();
            setUpdating(false);
            setOpen(true);
        } else {
            alert('ไม่พบข้อมูลปฏิทินวันนี้');
        }
    };

    const getCheckinData = async () => {
        // get all
        // const res = await getCheckinTodayList();
        const date = dayjs().format('YYYY-MM-DD');
        const res = await getWorkTimeListWithStatus({ startDateString: date, endDateString: date, status: 99 });

        // setCheckinList([...res.filter((f) => f.status === 99 && dayjs(Number(f.time)).isSame(dayjs(), 'day'))]);
        setCheckinList([...res]);
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
                                        <TableBodyCell>{dayjs(`${c.date} ${c.time}`).format('DD-MM-YYYY HH:mm')}</TableBodyCell>
                                        <TableBodyCell>{c.remark}</TableBodyCell>
                                        <TableBodyCell>{c.reason}</TableBodyCell>
                                        <TableBodyCell sx={{ whiteSpace: 'break-spaces' }}>
                                            {`${c.device?.osName || c.device?.os}-${c.device?.browserName || c.device?.ua}`}
                                            <br />
                                            {`[${c?.latlng?.lat},${c?.latlng?.lng}]`}
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
