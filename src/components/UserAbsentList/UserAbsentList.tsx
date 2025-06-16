import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { getAbsentList, updateAbsent } from 'components/common/FirebaseProvider/firebaseApi/absentApi';
import { updateUserCheckin, updateUserCheckinCalendar } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import { getLeavePeriod, getLeaveType } from 'helper/leaveType';
import { useEffect, useState } from 'react';
import { AbsentData, CheckinCalendar } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNotification } from 'components/common/NotificationCenter';
import { useFirebase } from 'components/common/FirebaseProvider';

dayjs.extend(customParseFormat);

function UserAbsentList({ dateList = [], afterUndate }: { dateList: CheckinCalendar[]; afterUndate: () => Promise<void> | void }) {
    const { openNotify } = useNotification();
    const { profile } = useFirebase();
    const [updating, setUpdating] = useState(false);
    const [absentList, setAbsentList] = useState<AbsentData[]>([]);
    //

    const onApprove = (data: AbsentData) => {
        const start = dayjs(data.startDate);
        const end = dayjs(data.endDate);
        const datesInRange: string[] = [];

        let currentDate = start;
        while (currentDate.isBefore(end) || currentDate.isSame(end)) {
            datesInRange.push(currentDate.format('DD-MM-YYYY'));
            currentDate = currentDate.add(1, 'day');
        }

        const datesToCheckSet = new Set(dateList.map((entry) => entry.date));
        const isRangeInDates = datesInRange.every((date) => datesToCheckSet.has(date));

        if (!isRangeInDates) return alert('date not match');

        const all = datesInRange.map((d) => {
            // DD-MM-YYYY
            const cd = dateList.find((f) => f.date === d);

            if (cd && cd?.id) {
                const userCheckinList = cd.userCheckinList.filter((f) => f && f.email !== data.email);

                // return updateUserCheckin(cd.id, '', [
                //     ...userCheckinList,
                //     {
                //         remark: `${getLeaveType(data.leaveType)} - ${getLeavePeriod(data.leavePeriod)}`,
                //         time: '',
                //         email: data?.email,
                //         googleId: data?.googleId ?? '',
                //         reason: data?.reason ?? '',
                //     },
                // ]);
                const rd = dayjs(d, 'DD-MM-YYYY');
                return updateUserCheckinCalendar({
                    year: rd.get('year'),
                    month: rd.get('month'),
                    date: rd.get('date'),
                    userCheckinList: [
                        ...userCheckinList.filter((f) => !!f),
                        {
                            remark: `${getLeaveType(data.leaveType)} - ${getLeavePeriod(data.leavePeriod)}`,
                            time: '',
                            email: data?.email,
                            googleId: data?.googleId ?? '',
                            reason: data?.reason ?? '',
                            approveBy: profile?.name ?? '',
                            approveByGoogleId: profile?.googleId ?? '',
                        },
                    ],
                });
            }
        });

        // console.log('all:', all);
        setUpdating(true);
        Promise.all(all).then(async () => {
            if (data.id) {
                await updateAbsent(data.id, {
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
                                        <TableBodyCell>{`${getLeaveType(c.leaveType)} - ${getLeavePeriod(c.leavePeriod)}`}</TableBodyCell>
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
