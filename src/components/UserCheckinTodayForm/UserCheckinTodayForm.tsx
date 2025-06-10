import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Slide,
    Snackbar,
    TextField,
} from '@mui/material';
import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFirebase } from 'components/common/FirebaseProvider';
import { updateUserCheckin } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { CheckinCalendar, Profile, UserCheckinList } from 'type.global';

type UpdateFormData = {
    dateId: string;
    userId: string;
    time?: string;
    remark?: string;
};

function UserCheckinTodayForm({
    dateList = [],
    userList = [],
    afterUndate,
}: {
    dateList: CheckinCalendar[];
    userList: Profile[];
    afterUndate: () => Promise<void> | void;
}) {
    const { profile } = useFirebase();
    //
    const [open, setOpen] = useState(false);
    const [updateDataForm, setUpdateDataForm] = useState<UpdateFormData>({ dateId: '', userId: '', remark: '' });
    const [updating, setUpdating] = useState(false);
    //
    const updateCheckin = async (payload: { dateId: string; userId: string; userCheckinList: UserCheckinList[] }) => {
        setUpdating(true);
        try {
            await updateUserCheckin(payload.dateId, payload.userId, payload.userCheckinList);
            await afterUndate();

            setOpen(true);
        } catch (error) {
            console.error('error:', error);
        }
        setUpdating(false);
    };

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const u = userList.find((f) => f.id === updateDataForm.userId);
        const d = dateList.find((f) => f.id === updateDataForm.dateId);
        if (u && d) {
            const userCheckinList = d?.userCheckinList
                .filter((f) => f && f?.email !== u.email)
                .map((f) => ({
                    remark: f.remark ?? '',
                    time: f.time ?? '',
                    email: f?.email,
                    googleId: f?.googleId ?? '',
                    reason: f.reason ?? '',
                }));
            updateCheckin({
                dateId: updateDataForm.dateId,
                userId: '',
                userCheckinList: [
                    ...userCheckinList,
                    {
                        remark: updateDataForm.remark ?? '',
                        time: updateDataForm.time ?? '',
                        email: u?.email,
                        googleId: u?.googleId ?? '',
                        reason: '',
                    },
                ],
            });
        }
    };

    const onChangeData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setUpdateDataForm((prev) => ({
            ...prev,
            [e.target.name ?? '']: e.target.value,
        }));
    };

    useEffect(() => {
        // set form data current date
        if (dateList.length > 0) {
            const currentDate = dayjs().format('DD-MM-YYYY');
            const findData = dateList.find((f) => f.date === currentDate);
            if (findData) {
                setUpdateDataForm((prev) => ({ ...prev, dateId: findData.id ?? '' }));
            }
        }
    }, [JSON.stringify(dateList)]);

    return (
        <Box component={'form'} onSubmit={onSubmit}>
            <Grid container spacing={2} marginTop={3}>
                {/* Date (Disabled Select) */}
                <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                    <FormControl
                        required
                        error={!updateDataForm.dateId}
                        disabled={profile?.role !== 'ADMIN'}
                        // disabled
                        fullWidth
                    >
                        <InputLabel id='date-label'>วันที่</InputLabel>
                        <Select labelId='date-label' name='dateId' value={updateDataForm.dateId} onChange={onChangeData} label='วันที่'>
                            {dateList.map((d) => (
                                <MenuItem key={d.id} value={d.id}>
                                    {d.date}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Employee Select */}
                <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                    <FormControl fullWidth>
                        <InputLabel id='employee-label'>พนักงาน</InputLabel>
                        <Select
                            labelId='employee-label'
                            name='userId'
                            value={updateDataForm.userId}
                            onChange={onChangeData}
                            label='พนักงาน'
                        >
                            <MenuItem value=''>select</MenuItem>
                            {userList.map((u, index) => (
                                <MenuItem key={index} value={u.id}>
                                    {u.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                {/* Time Input */}
                <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DesktopTimePicker
                            label='เวลา'
                            ampm={false}
                            timeSteps={{ minutes: 1 }}
                            slotProps={{
                                textField: {
                                    name: 'time',
                                    required: !updateDataForm.time && !updateDataForm.remark,
                                    error: !updateDataForm.time && !updateDataForm.remark,
                                    fullWidth: true,
                                },
                            }}
                            onChange={(newValue) => {
                                setUpdateDataForm((prev) => ({
                                    ...prev,
                                    time: newValue ? dayjs(newValue).format('HH:mm') : '',
                                }));
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                {/* Note Input */}
                <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                    <TextField fullWidth name='remark' label='หมายเหตุ' value={updateDataForm.remark} onChange={onChangeData} />
                </Grid>
                {/* Update Button */}
                <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                    <Box display='flex' alignItems='center' height={'100%'}>
                        <Button size='large' variant='contained' color='primary' type='submit' loading={updating}>
                            update
                        </Button>
                    </Box>
                </Grid>
            </Grid>
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
        </Box>
    );
}

export default UserCheckinTodayForm;
