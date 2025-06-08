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
import { AbsentData, FirebaseQuery, LeavePeriods, LeaveTypes } from 'type.global';
import { createAbsent, getUserAbsent } from 'components/common/FirebaseProvider/firebaseApi/absentApi';
import { useFirebase } from 'components/common/FirebaseProvider';

dayjs.locale('th');

type AbsentForm = {
    leaveType?: LeaveTypes;
    leavePeriod?: LeavePeriods;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    reason: string;
};

const leaveTypes = [
    { label: 'ลาพักร้อน', value: 'VACATION' },
    { label: 'ลาป่วย', value: 'SICK' },
    { label: 'ลากิจ', value: 'PERSONAL' },
];

const leavePeriods = [
    { label: 'ลาเช้า', value: 'HALF_DAY_AM' },
    { label: 'ลาบ่าย', value: 'HALF_DAY_PM' },
    { label: 'ทั้งวัน', value: 'FULL_DAY' },
];

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

function Absent() {
    const { profile } = useFirebase();
    //
    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [absentList, setAbsentList] = useState<(FirebaseQuery & AbsentData)[]>([]);
    const [alertOptions, setAlertOptions] = useState({
        message: '',
        color: '',
        open: false,
    });
    const [absentForm, setAbsentForm] = useState<AbsentForm>({
        leaveType: undefined,
        leavePeriod: undefined,
        startDate: null,
        endDate: null,
        reason: '',
    });

    const getLeaveType = (value: LeaveTypes) => {
        const findData = leaveTypes.find((f) => f.value === value);

        return findData?.label;
    };
    const getLeavePeriod = (value: LeavePeriods) => {
        const findData = leavePeriods.find((f) => f.value === value);

        return findData?.label;
    };

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !absentForm.leaveType ||
            !absentForm.leavePeriod ||
            !absentForm.leaveType ||
            !absentForm.startDate ||
            !absentForm.endDate ||
            !profile?.email ||
            !profile?.googleId
        )
            return;

        setIsSending(true);
        try {
            await createAbsent({
                email: profile.email,
                googleId: profile.googleId,
                leaveType: absentForm.leaveType,
                leavePeriod: absentForm.leavePeriod,
                startDate: absentForm.startDate.format('YYYY-MM-DD'),
                endDate: absentForm.endDate.format('YYYY-MM-DD'),
                reason: absentForm.reason,
                status: 'WAITING',
            });

            await getAbsent(profile.googleId);

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
        const isRangeValid = absentForm.startDate && absentForm.endDate && absentForm.endDate.diff(absentForm.startDate, 'day') > 0;
        if (!isRangeValid) {
            setAbsentForm((prev) => ({ ...prev, leavePeriod: 'FULL_DAY' }));
        }

        return !isRangeValid;
    }, [absentForm.startDate, absentForm.endDate]);

    const getAbsent = async (googleId: string) => {
        try {
            const res = await getUserAbsent(googleId);
            setAbsentList([...res]);
        } catch (error) {
            console.log('error:', error);
        }
    };

    useEffect(() => {
        if (profile?.googleId) getAbsent(profile.googleId);
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
                            {absentList.map((m) => (
                                <TableRow key={m.id}>
                                    <TableBodyCell>{`${dayjs(m.startDate).format('DD/MM/YYYY')} - ${dayjs(m.endDate).format(
                                        'DD/MM/YYYY'
                                    )}`}</TableBodyCell>
                                    <TableBodyCell>{`${getLeaveType(m.leaveType)} - ${getLeavePeriod(m.leavePeriod)}`}</TableBodyCell>
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
                                        maxDate={absentForm.endDate || undefined}
                                        onAccept={(newValue) => {
                                            setAbsentForm((prev) => ({ ...prev, startDate: newValue }));
                                        }}
                                        slotProps={{
                                            textField: {
                                                required: true,
                                                error: !absentForm.startDate,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <CustomMobileDatePicker
                                        label='วันสิ้นสุด'
                                        // value={absentForm.endDate}
                                        minDate={absentForm.startDate || undefined}
                                        onAccept={(newValue) => {
                                            setAbsentForm((prev) => ({ ...prev, endDate: newValue }));
                                        }}
                                        slotProps={{
                                            textField: {
                                                required: true,
                                                error: !absentForm.endDate,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl required fullWidth error={!absentForm.leaveType}>
                                    <FormLabel sx={{ fontSize: '0.9rem' }}>ประเภทการลา</FormLabel>
                                    <ToggleButtonGroup
                                        fullWidth
                                        value={absentForm.leaveType}
                                        exclusive
                                        onChange={(_, value) => {
                                            setAbsentForm((prev) => ({ ...prev, leaveType: value }));
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
                                <FormControl required fullWidth error={!absentForm.leavePeriod}>
                                    <FormLabel sx={{ fontSize: '0.9rem' }}>ช่วงเวลา</FormLabel>
                                    <ToggleButtonGroup
                                        fullWidth
                                        value={absentForm.leavePeriod}
                                        disabled={!isOneDay}
                                        exclusive
                                        onChange={(_, value) => {
                                            setAbsentForm((prev) => ({ ...prev, leavePeriod: value }));
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
                                    value={absentForm.reason}
                                    onChange={(e) => setAbsentForm((prev) => ({ ...prev, reason: e.target.value }))}
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

export default Absent;
