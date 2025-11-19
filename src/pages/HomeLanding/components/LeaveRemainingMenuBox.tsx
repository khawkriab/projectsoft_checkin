import { Box, Drawer, IconButton, Stack, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import { Close } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { getUserLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { LeaveData } from 'type.global';
import { useFirebase } from 'context/FirebaseProvider';
import { TableBodyCell } from 'components/common/MuiTable';
import dayjs from 'dayjs';
import { getLeavePeriodLabel, getLeaveType } from 'helper/leaveType';

function AmountBox({ remaining, total, label }: { remaining: number; total: number; label: string }) {
    return (
        <Stack justifyContent={'center'}>
            <Box display={'flex'} alignItems={'baseline'} justifyContent={'center'} gap={0.5}>
                <Typography variant='h3'>{remaining}</Typography>
                <Typography sx={(theme) => ({ color: theme.palette.primary.light })}>/{total}</Typography>
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
    //
    const getLeave = async (suid: string) => {
        try {
            const res = await getUserLeave(suid);
            setLeaveList([...res]);
        } catch (error) {
            console.log('error:', error);
        }
    };

    useEffect(() => {
        if (profile?.suid && open) getLeave(profile.suid);
    }, [profile?.suid, open]);
    //
    return (
        <>
            <MenuBox flex={'auto'} minHeight={`${50 * 2}px`} onClick={() => setOpen(true)}>
                <Stack direction={'row'} width={'100%'} spacing={1} justifyContent={'space-around'}>
                    <AmountBox remaining={6} total={7} label='ลาป่วย' />
                    <AmountBox remaining={6} total={7} label='ลากิจ' />
                    <AmountBox remaining={6} total={7} label='ลาพักร้อน' />
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
