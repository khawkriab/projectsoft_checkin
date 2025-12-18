import {
    Box,
    Button,
    Drawer,
    FormControl,
    FormLabel,
    Grid,
    IconButton,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { MenuBox } from './MenuBox';
import { Close, MailOutline } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { LeavePeriodsType, LeaveTypes } from 'type.global';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFirebase } from 'context/FirebaseProvider';
import { createLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { leavePeriods, leaveTypes } from 'helper/leaveType';
import { useNotification } from 'components/common/NotificationCenter';
import { MuiMobileDatePicker } from 'components/common/MuiInput';

dayjs.locale('th');

type LeaveForm = {
    leaveType?: LeaveTypes;
    leavePeriod?: LeavePeriodsType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    reason: string;
};

export function LeaveRequestMenuBox() {
    const { profile } = useFirebase();
    const { openNotify } = useNotification();
    //
    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [leaveForm, setLeaveForm] = useState<LeaveForm>({
        leaveType: undefined,
        leavePeriod: undefined,
        startDate: null,
        endDate: null,
        reason: '',
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
            !profile?.email ||
            !profile?.suid
        )
            return;

        setIsSending(true);
        try {
            await createLeave({
                name: profile.name,
                email: profile.email,
                suid: profile.suid,
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
        setOpen(false);
    };

    const isOneDay = useMemo(() => {
        const isRangeValid = leaveForm.startDate && leaveForm.endDate && leaveForm.endDate.diff(leaveForm.startDate, 'day') > 0;
        if (!isRangeValid) {
            setLeaveForm((prev) => ({ ...prev, leavePeriod: 'FULL_DAY' }));
        }

        return !isRangeValid;
    }, [leaveForm.startDate, leaveForm.endDate]);

    return (
        <>
            <MenuBox
                onClick={() => setOpen(true)}
                sx={(theme) => ({
                    minHeight: `${50 * 2}px`,
                    flex: 'auto',
                    bgcolor: theme.palette.mode === 'light' ? '#FF5252' : 'transparent',
                    color: theme.palette.primary.contrastText,
                    justifyContent: 'center',
                    gap: '6px',
                    flexDirection: { xs: 'column-reverse', lg: 'row' },
                    cursor: 'pointer',
                })}
            >
                <Typography>เขียนใบลา</Typography>
                <MailOutline sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
            </MenuBox>
            {/* ---------------------------------  --------------------------------- */}
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
                    <Typography variant='h5'>ใบลา</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <Close color='error' />
                    </IconButton>
                </Box>
                <hr style={{ width: '100%', margin: '12px 0 24px' }} />
                <Box component={'form'} height={'100%'} onSubmit={onSubmit}>
                    <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} height={'100%'}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <MuiMobileDatePicker
                                        label='วันเริ่มต้น'
                                        minDate={dayjs()}
                                        maxDate={leaveForm.endDate || undefined}
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
                                    <MuiMobileDatePicker
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
                                        disabled={!isOneDay}
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
            </Drawer>
        </>
    );
}
