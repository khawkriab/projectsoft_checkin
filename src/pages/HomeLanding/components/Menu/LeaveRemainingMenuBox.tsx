import { Box, Drawer, IconButton, Stack, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import { Close } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { getUserLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { AnnualLeaveEntitlement, LeaveData } from 'type.global';
import { useFirebase } from 'context/FirebaseProvider';
import { TableBodyCell } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';
import { getAnnualLeaveEntitlement } from 'context/FirebaseProvider/firebaseApi/userApi';
import { summarizeUserLeave } from 'utils/summarizeUserLeave';
import { numberjs } from 'utils/numberJs';

export function AmountBox({
    remaining,
    total,
    label,
    type,
}: {
    remaining: number;
    total: number;
    label: string;
    type: 'SICK' | 'PERSONAL' | 'VACATION';
}) {
    const statusColor = useMemo(() => {
        if (type === 'PERSONAL') {
            if (remaining <= 1) {
                return 'error.light';
            }
            if (remaining <= 2) {
                return 'warning.light';
            }

            return 'success.light';
        }
        if (type === 'VACATION') {
            if (remaining <= 3) {
                return 'error.light';
            }
            if (remaining <= 5) {
                return 'warning.light';
            }

            return 'success.light';
        }

        return 'text.primary';
    }, [type, remaining]);

    return (
        <Stack justifyContent={'center'} textAlign={'center'}>
            <Box display={'flex'} alignItems={'baseline'} justifyContent={'center'} gap={0.5}>
                <Typography variant='h4' sx={{ color: statusColor }}>
                    {remaining}
                </Typography>
                <Typography sx={(theme) => ({ fontSize: '1.25rem', color: theme.palette.primary.main })}>/ {total}</Typography>
            </Box>
            <Box sx={(theme) => ({ color: theme.palette.primary.light })}>{label}</Box>
        </Stack>
    );
}

export function LeaveRemainingMenuBox() {
    const { profile } = useFirebase();
    //
    const [open, setOpen] = useState(false);
    const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
    const [annualLeaveEntitlement, setAnnualLeaveEntitlement] = useState<
        (AnnualLeaveEntitlement & { summaryLeaveDays: AnnualLeaveEntitlement }) | null
    >(null);
    //

    useEffect(() => {
        const getLeave = async () => {
            if (!profile?.suid) return;

            try {
                const res = await getUserLeave(profile.suid, dayjs().year());
                const resLeave = await getAnnualLeaveEntitlement(profile.suid);

                const s = summarizeUserLeave(res);
                const currentYear = resLeave.annualLeaveEntitlement.find((f) => f.years === dayjs().year());

                if (currentYear) {
                    setAnnualLeaveEntitlement({
                        ...currentYear,
                        summaryLeaveDays: {
                            years: currentYear.years,
                            ...s,
                        },
                    });
                }

                setLeaveList([...res]);
            } catch (error) {
                console.error('error:', error);
            }
        };

        getLeave();
    }, [profile?.suid]);
    //
    return (
        <>
            <MenuBox flex={'auto'} minHeight={`${50 * 2}px`} onClick={() => setOpen(true)}>
                <Stack direction={'row'} width={'100%'} spacing={1} justifyContent={'space-around'}>
                    <AmountBox
                        remaining={numberjs(annualLeaveEntitlement?.sick).del(annualLeaveEntitlement?.summaryLeaveDays.sick).value}
                        total={annualLeaveEntitlement?.sick || 0}
                        label='ลาป่วย'
                        type='SICK'
                    />
                    <AmountBox
                        remaining={numberjs(annualLeaveEntitlement?.personal).del(annualLeaveEntitlement?.summaryLeaveDays.personal).value}
                        total={annualLeaveEntitlement?.personal || 0}
                        label='ลากิจ'
                        type='PERSONAL'
                    />
                    <AmountBox
                        remaining={numberjs(annualLeaveEntitlement?.vacation).del(annualLeaveEntitlement?.summaryLeaveDays.vacation).value}
                        total={annualLeaveEntitlement?.vacation || 0}
                        label='ลาพักร้อน'
                        type='VACATION'
                    />
                </Stack>
            </MenuBox>
            <Drawer
                anchor='right'
                slotProps={{
                    paper: {
                        sx: {
                            width: '100%',
                            maxWidth: '600px',
                            boxSizing: 'border-box',
                            padding: { xs: 1, sm: 3 },
                        },
                    },
                }}
                open={open}
                // open
                onClose={() => setOpen(false)}
            >
                <Box display={'flex'} justifyContent={'space-between'}>
                    <Typography variant='h5'>ประวัติการลา</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <Close color='error' />
                    </IconButton>
                </Box>
                <hr style={{ width: '100%', margin: '12px 0 24px' }} />

                <Box>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {leaveList.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableBodyCell>{`${dayjs(m.startDate).format('DD/MM/YYYY')} - ${dayjs(m.endDate).format(
                                            'DD/MM/YYYY'
                                        )}`}</TableBodyCell>
                                        <TableBodyCell>{`${getLeaveType(m.leaveType)} - ${getLeavePeriodLabel(
                                            m.leavePeriod
                                        )}`}</TableBodyCell>
                                        <TableBodyCell>{m.reason}</TableBodyCell>
                                        <TableBodyCell>{m.status}</TableBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Drawer>
        </>
    );
}
