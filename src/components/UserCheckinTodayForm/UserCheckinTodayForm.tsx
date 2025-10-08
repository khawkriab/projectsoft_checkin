import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useFirebase } from 'context/FirebaseProvider';
import { getUserWorkTime, updateUserCheckinCalendar, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { useNotification } from 'components/common/NotificationCenter';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { CheckinCalendar, CheckinDate, Profile, UserCheckInDate, UserCheckinList } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CalendarDateExtendText } from 'pages/Home/HomeFirebase';

dayjs.extend(customParseFormat);

type UpdateFormData = {
    dateId: string;
    email: string;
    time?: string;
    remark?: string;
};

function UserCheckinTodayForm({
    dateList = [],
    userList = [],
    afterUndate,
}: {
    dateList: CalendarDateExtendText[];
    userList: Profile[];
    afterUndate: () => Promise<void> | void;
}) {
    const { profile } = useFirebase();
    const { openNotify } = useNotification();
    //

    const [updateDataForm, setUpdateDataForm] = useState<UpdateFormData>({ dateId: '', email: '', remark: '' });
    const [updating, setUpdating] = useState(false);
    //

    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        const u = userList.find((f) => f.email === updateDataForm.email);
        const d = dateList.find((f) => f.id === updateDataForm.dateId);

        if (u && d) {
            const parseData = dayjs(d.date);
            const res = await getUserWorkTime({ startDate: parseData.format('YYYY-MM-DD'), email: u.email });

            const payload: CheckinDate = {
                date: parseData.format('YYYY-MM-DD'),
                email: u.email,
                googleId: u.googleId,
                name: u.name,
                time: updateDataForm.time ?? res?.time ?? '',
                remark: updateDataForm.remark ?? res?.remark ?? '',
                reason: res?.reason ?? '',
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                leavePeriod: res?.leavePeriod || null,
                leaveType: res?.leaveType || null,
                absentId: res?.absentId || null,
                isWorkOutside: updateDataForm?.remark?.toLowerCase().includes('wfh') ?? false,
                status: 1,
            };

            try {
                await updateWorkTime(payload, res?.id);
                await afterUndate();

                setUpdateDataForm((prev) => ({ ...prev, email: '', remark: '' }));
                openNotify('success', 'updated successfully');
            } catch (error) {
                console.error('error:', error);
            }
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
            const currentDate = dayjs().format('YYYY-MM-DD');
            const findData = dateList.find((f) => f.date === currentDate);
            if (findData) {
                setUpdateDataForm((prev) => ({ ...prev, dateId: findData.id ?? '' }));
            } else {
                setUpdateDataForm((prev) => ({ ...prev, dateId: dateList[0].id ?? '' }));
            }
        }

        return () => {
            setUpdateDataForm((prev) => ({ ...prev, dateId: '' }));
        };
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
                            name='email'
                            value={updateDataForm.email}
                            required
                            error={!updateDataForm.email}
                            onChange={onChangeData}
                            label='พนักงาน'
                        >
                            <MenuItem value=''>select</MenuItem>
                            {userList.map((u, index) => (
                                <MenuItem key={index} value={u.email}>
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
        </Box>
    );
}

export default UserCheckinTodayForm;
