import {
    Box,
    Button,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { TableBodyCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { LocalizationProvider, MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import { LeaveData, FirebaseQuery, LeavePeriodsType, LeaveTypes, Profile, AnnualLeaveEntitlement } from 'type.global';
import { createLeave, getLeaveList } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { getLeavePeriodLabel, getLeaveType, leavePeriods, leaveTypes } from 'helper/leaveType';
import { FilterCheckinUser } from 'components/common/FilterCheckinUser';
import { getAnnualLeaveEntitlement, getUsersList, updateAnnualLeaveEntitlement } from 'context/FirebaseProvider/firebaseApi/userApi';
import { useFirebase } from 'context/FirebaseProvider';
import { useNotification } from 'components/common/NotificationCenter';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.locale('th');

type LeaveForm = {
    leaveType?: LeaveTypes;
    leavePeriod?: LeavePeriodsType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    reason: string;
    suid: string;
};

function CustomMobileDatePicker(props: MobileDatePickerProps) {
    const [showDialog, setShowDialog] = useState(false);
    return (
        <MobileDatePicker
            {...props}
            open={showDialog}
            onOpen={() => setShowDialog(true)}
            onClose={() => setShowDialog(false)}
            format='DD/MM/YYYY'
            sx={{
                '& .MuiPickersOutlinedInput-root.Mui-disabled *': {
                    color: '#000',
                },
            }}
            slotProps={{
                textField: {
                    fullWidth: true,
                    onClick: () => setShowDialog(true),
                    disabled: true,
                    InputLabelProps: {
                        shrink: true,
                    },
                    ...props?.slotProps?.textField,
                },
            }}
        />
    );
}

function LeaveRequestBox({ userList }: { userList: Profile[] }) {
    const { profile } = useFirebase();
    const { openNotify } = useNotification();
    //
    const [isSending, setIsSending] = useState(false);
    const [leaveForm, setLeaveForm] = useState<LeaveForm>({
        leaveType: undefined,
        leavePeriod: undefined,
        startDate: null,
        endDate: null,
        reason: '',
        suid: '',
    });
    //

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !leaveForm.leaveType ||
            !leaveForm.leavePeriod ||
            !leaveForm.leaveType ||
            !leaveForm.startDate ||
            !leaveForm.endDate ||
            !leaveForm?.suid
        )
            return;

        const findUser = userList.find((f) => f.suid === leaveForm.suid);

        if (!findUser) return;

        setIsSending(true);
        try {
            await createLeave({
                name: findUser.name,
                email: findUser.email,
                suid: findUser.suid,
                leaveType: leaveForm.leaveType,
                leavePeriod: leaveForm.leavePeriod,
                startDate: leaveForm.startDate.format('YYYY-MM-DD'),
                endDate: leaveForm.endDate.format('YYYY-MM-DD'),
                reason: leaveForm.reason,
                status: 'WAITING',
                approveBy: '',
                approveBySuid: '',
            });

            // await getLeave(profile.suid);

            openNotify('success', 'success send');
        } catch (error) {
            console.error('error:', error);

            openNotify('error', 'error');
        }
        setIsSending(false);
    };

    return (
        <Box component={'form'} height={'100%'} onSubmit={onSubmit}>
            <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} height={'100%'}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                        <TextField select fullWidth onChange={(e) => setLeaveForm((prev) => ({ ...prev, suid: e.target.value }))}>
                            {userList.map((e) => (
                                <MenuItem value={e.suid}>{e.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <CustomMobileDatePicker
                                label='วันเริ่มต้น'
                                // minDate={dayjs()}
                                // maxDate={leaveForm.endDate || undefined}
                                onAccept={(newValue) => {
                                    setLeaveForm((prev) => ({ ...prev, startDate: newValue }));
                                }}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        error: !leaveForm.startDate,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <CustomMobileDatePicker
                                label='วันสิ้นสุด'
                                // value={leaveForm.endDate}
                                minDate={leaveForm.startDate || undefined}
                                onAccept={(newValue) => {
                                    setLeaveForm((prev) => ({ ...prev, endDate: newValue }));
                                }}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        error: !leaveForm.endDate,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl required fullWidth error={!leaveForm.leaveType}>
                            <FormLabel sx={{ fontSize: '0.9rem' }}>ประเภทการลา</FormLabel>
                            <ToggleButtonGroup
                                fullWidth
                                value={leaveForm.leaveType}
                                exclusive
                                onChange={(_, value) => {
                                    setLeaveForm((prev) => ({ ...prev, leaveType: value }));
                                }}
                                color='primary'
                            >
                                {leaveTypes.map((m) => (
                                    <ToggleButton key={m.value} value={m.value}>
                                        {m.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl required fullWidth error={!leaveForm.leavePeriod}>
                            <FormLabel sx={{ fontSize: '0.9rem' }}>ช่วงเวลา</FormLabel>
                            <ToggleButtonGroup
                                fullWidth
                                value={leaveForm.leavePeriod}
                                // disabled={!isOneDay}
                                exclusive
                                onChange={(_, value) => {
                                    setLeaveForm((prev) => ({ ...prev, leavePeriod: value }));
                                }}
                                color='primary'
                            >
                                {leavePeriods.map((m) => (
                                    <ToggleButton key={m.value} value={m.value}>
                                        {m.label}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            sx={{ marginTop: 2 }}
                            label='เหตุผลการลา'
                            multiline
                            rows={4}
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Typography color='error'>***หมายเหตุ***</Typography>
                        <Typography color='error'>
                            ถ้าลากิจหรือลาป่วย ให้แจ้งพี่โอ๊ตก่อนเขียนใบลา หากไม่แจ้งและถูกปฏิเสธจะถือว่าขาด
                        </Typography>
                    </Grid>
                </Grid>
                <Box display={'flex'} justifyContent={'flex-end'}>
                    <Button loading={isSending} type='submit' variant='contained' color='primary'>
                        Send
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export function AmountBox({ remaining, total, label }: { remaining: number; total: number; label: string }) {
    return (
        <Stack justifyContent={'center'}>
            <Box display={'flex'} alignItems={'baseline'} justifyContent={'center'} gap={0.5}>
                <Typography variant='h6' sx={{ color: total - remaining < 0 ? '#f00' : '#000' }}>
                    {remaining}
                </Typography>
                <Typography sx={(theme) => ({ color: theme.palette.primary.main })}>/ {total}</Typography>
            </Box>
            <Box sx={(theme) => ({ color: theme.palette.primary.main })}>{label}</Box>
        </Stack>
    );
}

function getDateDiff(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive days
}

function summarizeUserLeave(list: LeaveData[]) {
    const periodValue = {
        HALF_DAY_AM: 0.5,
        HALF_DAY_PM: 0.5,
        FULL_DAY: 1,
    } as const;

    return list.reduce(
        (acc, item) => {
            let leaveDays = 0;

            if (item.startDate === item.endDate) {
                // single day leave → use leavePeriod
                leaveDays = periodValue[item.leavePeriod];
            } else {
                // multi-day leave → calculate days
                const days = getDateDiff(item.startDate, item.endDate);
                leaveDays = days * 1; // assume each day is FULL_DAY
            }

            if (item.leaveType === 'PERSONAL') {
                acc.personal += leaveDays;
            } else if (item.leaveType === 'SICK') {
                acc.sick += leaveDays;
            } else if (item.leaveType === 'VACATION') {
                acc.vacation += leaveDays;
            }

            return acc;
        },
        {
            personal: 0,
            sick: 0,
            vacation: 0,
        }
    );
}

function LeaveRequest() {
    const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
    const [userList, setUserList] = useState<(Profile & { annualLeaveEntitlement: AnnualLeaveEntitlement[] })[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]); // default all user
    //

    const userUsedLeaveDays = useMemo(() => {
        const temp = userList.map((m) => {
            const n = m.annualLeaveEntitlement.map((a) => {
                const l = leaveList.filter((f) => f.suid === m.suid && a.id === String(dayjs(f.startDate).year()));
                const r = summarizeUserLeave(l);

                return {
                    years: a.id,
                    all: a,
                    used: r,
                };
            });

            return {
                ...m,
                summaryLeaveDays: n,
            };
        });
        return temp;
    }, [JSON.stringify(leaveList), JSON.stringify(userList)]);

    const userListFilter = useMemo(() => {
        if (userFilterList.length <= 0) return [];

        const eml = userFilterList.map((m) => m.suid);
        return leaveList.filter((f) => eml.includes(f.suid));
    }, [JSON.stringify(leaveList), JSON.stringify(userFilterList)]);

    useEffect(() => {
        const getLeave = async () => {
            try {
                const res = await getLeaveList();
                setLeaveList([...res.sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())]);
            } catch (error) {
                console.log('error:', error);
            }
        };

        const getAllUser = async () => {
            try {
                const res = await getUsersList();

                const annualLeaveEntitlement = res.filter((f) => f.status === 'APPROVE').map((m) => getAnnualLeaveEntitlement(m.suid));

                Promise.all(annualLeaveEntitlement).then((entitlement) => {
                    const remap = res
                        .filter((f) => f.jobPosition !== 'CEO' && f.status === 'APPROVE')
                        .map((user) => {
                            const r = entitlement.find((f) => f.suid === user.suid);
                            return {
                                ...user,
                                annualLeaveEntitlement: r?.annualLeaveEntitlement || [],
                            };
                        });
                    setUserList(remap);
                });
            } catch (error) {
                console.log('error:', error);
            }
        };

        getLeave();
        getAllUser();
    }, []);

    return (
        <Box>
            <Box marginBottom={4}>
                <Typography variant='h5'>สรุปการลา</Typography>
                <Divider sx={{ margin: '12px 0' }} />
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    {userUsedLeaveDays.map((u) => (
                        <Paper
                            key={u.suid}
                            sx={(theme) => ({ padding: 2, borderRadius: 2, flex: 1, border: `1px solid ${theme.palette.primary.light}` })}
                        >
                            <Typography variant='h6'>
                                {u.name} {u.fullName}
                            </Typography>
                            <Divider />
                            {u.summaryLeaveDays.map((s) => (
                                <Box key={s.years}>
                                    <Box>{s.years}</Box>
                                    <Divider />
                                    <Stack direction={'row'} width={'100%'} spacing={1} justifyContent={'space-around'}>
                                        <AmountBox remaining={s.used.sick} total={s.all.sick} label='ลาป่วย' />
                                        <AmountBox remaining={s.used.personal} total={s.all.personal} label='ลากิจ' />
                                        <AmountBox remaining={s.used.vacation} total={s.all.vacation} label='ลาพักร้อน' />
                                    </Stack>
                                </Box>
                            ))}
                        </Paper>
                    ))}
                </Box>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} spacing={2}>
                <Typography variant='h5'>ประวัติการลา</Typography>
                <FilterCheckinUser userList={userList} onChangeFilter={(values) => setUserFilterList([...values])} />
            </Stack>
            <hr style={{ width: '100%', margin: '12px 0 24px' }} />
            <Box>
                <TableContainer>
                    <Table>
                        <TableBody>
                            {userListFilter.map((m) => (
                                <TableRow key={m.id}>
                                    <TableBodyCell>{m.name}</TableBodyCell>
                                    <TableBodyCell>{`${dayjs(m.startDate).format('DD/MM/YYYY')} - ${dayjs(m.endDate).format(
                                        'DD/MM/YYYY'
                                    )}`}</TableBodyCell>
                                    <TableBodyCell>{`${getLeaveType(m.leaveType)} - ${getLeavePeriodLabel(m.leavePeriod)}`}</TableBodyCell>
                                    <TableBodyCell>{m.reason}</TableBodyCell>
                                    <TableBodyCell>{m.status}</TableBodyCell>
                                    <TableBodyCell>by: {m.approveBy}</TableBodyCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default LeaveRequest;
