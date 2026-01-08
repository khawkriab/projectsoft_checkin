import { Alert, Box, Button, Paper, Slide, Snackbar, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import { getUserWorkTime, getWorkTimeListWithStatus, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import usePageVisibility from 'hooks/usePageVisibility';
import { useEffect, useRef, useState } from 'react';
import { CalendarDateConfig, CheckinDate } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CalendarDateExtendText } from 'pages/Home/component/CalendarTable';

dayjs.extend(customParseFormat);

function UserCheckinTodayList({
    dateList,
    todayConfig,
    afterUndate,
}: {
    dateList: CalendarDateExtendText[];
    todayConfig?: CalendarDateConfig;
    afterUndate: () => Promise<void> | void;
}) {
    const isVisible = usePageVisibility();
    const { profile } = useFirebase();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<CheckinDate[]>([]);
    const today = dayjs().format('YYYY-MM-DD');

    const onApprove = async (data: CheckinDate) => {
        const dateOnData = dayjs(data.date);
        const dateOnList = dateList.find((f) => f.date === dateOnData.format('YYYY-MM-DD'));

        if (dateOnList) {
            setUpdating(true);
            const parseData = dayjs(dateOnList.date);
            const res = await getUserWorkTime({ startDate: parseData.format('YYYY-MM-DD'), suid: data.suid });
            // console.log('res:', res);

            const payload: CheckinDate = {
                ...data,
                status: 1,
                approveBy: profile?.name ?? '',
                approveBySuid: profile?.suid ?? '',
            };

            try {
                await updateWorkTime(payload, res?.id);
            } catch (error) {
                console.error('error:', error);
            }

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
        // const date = dayjs('2025-11-21').format('YYYY-MM-DD');
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
                                    <TableRow key={c.suid}>
                                        <TableBodyCell>{c.name}</TableBodyCell>
                                        <TableBodyCell>{dayjs(`${c.date} ${c.time}`).format('DD-MM-YYYY HH:mm')}</TableBodyCell>
                                        <TableBodyCell>{c.remark}</TableBodyCell>
                                        <TableBodyCell>{c.reason}</TableBodyCell>
                                        <TableBodyCell sx={{ whiteSpace: 'break-spaces' }}>
                                            {`${c.device?.device}`}
                                            <br />
                                            {`${c.device?.getUA}`}
                                            <br />
                                            {`[${c?.latlng?.lat},${c?.latlng?.lng}]`}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {(profile?.role === 'ORGANIZATION' || profile?.role === 'ADMIN') && (
                                                <Button
                                                    size='small'
                                                    loading={updating}
                                                    variant='contained'
                                                    color='warning'
                                                    onClick={() => onApprove(c)}
                                                >
                                                    อนุมัติ
                                                </Button>
                                            )}

                                            {profile?.role === 'STAFF' &&
                                                c.date === today &&
                                                ((todayConfig?.isWFH && c.isWorkOutside) || !c.isWorkOutside) && (
                                                    <Button
                                                        size='small'
                                                        loading={updating}
                                                        variant='contained'
                                                        color='warning'
                                                        onClick={() => onApprove(c)}
                                                    >
                                                        อนุมัติ
                                                    </Button>
                                                )}
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
