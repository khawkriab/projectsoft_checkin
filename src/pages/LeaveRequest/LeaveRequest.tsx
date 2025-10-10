import {
    Alert,
    AlertColor,
    Box,
    Button,
    Drawer,
    FormControl,
    FormLabel,
    Grid,
    IconButton,
    Slide,
    Snackbar,
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
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useMemo, useState } from 'react';
import { LocalizationProvider, MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import { LeaveData, FirebaseQuery, LeavePeriodsType, LeaveTypes } from 'type.global';
import { createLeave, getUserLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { useFirebase } from 'context/FirebaseProvider';
import { getLeavePeriodLabel, getLeaveType, leavePeriods, leaveTypes } from 'helper/leaveType';

dayjs.locale('th');

type LeaveForm = {
    leaveType?: LeaveTypes;
    leavePeriod?: LeavePeriodsType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    reason: string;
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

function LeaveRequest() {
    const { profile } = useFirebase();
    //
    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [leaveList, setLeaveList] = useState<(FirebaseQuery & LeaveData)[]>([]);
    const [alertOptions, setAlertOptions] = useState({
        message: '',
        color: '',
        open: false,
    });
    const [leaveForm, setLeaveForm] = useState<LeaveForm>({
        leaveType: undefined,
        leavePeriod: undefined,
        startDate: null,
        endDate: null,
        reason: '',
    });

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !leaveForm.leaveType ||
            !leaveForm.leavePeriod ||
            !leaveForm.leaveType ||
            !leaveForm.startDate ||
            !leaveForm.endDate ||
            !profile?.email ||
            !profile?.googleId
        )
            return;

        setIsSending(true);
        try {
            await createLeave({
                name: profile.name,
                email: profile.email,
                googleId: profile.googleId,
                leaveType: leaveForm.leaveType,
                leavePeriod: leaveForm.leavePeriod,
                startDate: leaveForm.startDate.format('YYYY-MM-DD'),
                endDate: leaveForm.endDate.format('YYYY-MM-DD'),
                reason: leaveForm.reason,
                status: 'WAITING',
                approveBy: '',
                approveByGoogleId: '',
            });

            await getLeave(profile.googleId);

            setAlertOptions((prev) => ({
                ...prev,
                message: 'success send',
                color: 'success',
                open: true,
            }));
        } catch (error) {
            console.error('error:', error);

            setAlertOptions((prev) => ({
                ...prev,
                message: 'error',
                color: 'error',
                open: true,
            }));
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

    const getLeave = async (googleId: string) => {
        try {
            const res = await getUserLeave(googleId);
            setLeaveList([...res]);
        } catch (error) {
            console.log('error:', error);
        }
    };

    useEffect(() => {
        if (profile?.googleId) getLeave(profile.googleId);
    }, [profile?.googleId]);

    return (
        <Box>
            <Box display={'flex'} justifyContent={'end'}>
                <Button variant='contained' color='error' onClick={() => setOpen(true)}>
                    <Typography variant='subtitle1'>เขียนใบลา</Typography>
                </Button>
            </Box>
            <Typography variant='h5'>ประวัติการลา</Typography>
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
                                    <TableBodyCell>{`${getLeaveType(m.leaveType)} - ${getLeavePeriodLabel(m.leavePeriod)}`}</TableBodyCell>
                                    <TableBodyCell>{m.reason}</TableBodyCell>
                                    <TableBodyCell>{m.status}</TableBodyCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

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
                        <CloseIcon color='error' />
                    </IconButton>
                </Box>
                <hr style={{ width: '100%', margin: '12px 0 24px' }} />
                <Box component={'form'} height={'100%'} onSubmit={onSubmit}>
                    <Box display={'flex'} flexDirection={'column'} justifyContent={'space-between'} height={'100%'}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <CustomMobileDatePicker
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
                        </Grid>
                        <Box display={'flex'} justifyContent={'flex-end'}>
                            <Button loading={isSending} type='submit' variant='contained' color='primary'>
                                Send
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={alertOptions.open}
                autoHideDuration={6000}
                onClose={() =>
                    setAlertOptions((prev) => ({
                        ...prev,
                        message: '',
                        color: '',
                        open: false,
                    }))
                }
            >
                <Alert
                    onClose={() =>
                        setAlertOptions((prev) => ({
                            ...prev,
                            message: '',
                            color: '',
                            open: false,
                        }))
                    }
                    severity={alertOptions.color as AlertColor}
                    variant='filled'
                    sx={{ width: '100%' }}
                >
                    {alertOptions.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default LeaveRequest;
