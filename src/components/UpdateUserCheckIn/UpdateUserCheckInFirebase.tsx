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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getCellRange, getColumnLetter } from 'helper/getColumnLetter';
import { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import { EmployeeData, SheetsDate } from 'pages/Home/HomeSheets';
import { CheckinCalendar, Profile, UserCheckInData, UserCheckinList } from 'type.global';
import { DesktopTimePicker } from '@mui/x-date-pickers';
import { getCheckinCalendar, getCheckinTodayList, updateUserCheckin } from 'components/common/firebase/firebaseApi/checkinApi';

type FormData = {
    dateId: string;
    userId: string;
    time?: string;
    remark?: string;
};

type UpdateUserCheckInProps = {
    dateList: CheckinCalendar[];
    userList: Profile[];
    afterUndate: () => Promise<void> | void;
    getCheckin?: () => Promise<UserCheckInData[]>;
};

// type UserCheckInList = UserCheckInData & EmployeeData;
type UserCheckInList = UserCheckInData;

function UpdateUserCheckInFirebase({ dateList = [], userList = [], afterUndate = () => {}, getCheckin }: UpdateUserCheckInProps) {
    const { profile, auth2, authLoading, isSignedIn } = useGoogleLogin();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<UserCheckInList[]>([]);
    const [updateData, setUpdateData] = useState<FormData>({ dateId: '3', userId: '', remark: '' });
    //

    const updateCheckin = async (payload: { dateId: string; userId: string; userCheckinList: UserCheckinList[] }) => {
        await updateUserCheckin(payload.dateId, payload.userId, payload.userCheckinList);
    };
    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const u = userList.find((f) => f.id === updateData.userId);
        const d = dateList.find((f) => f.id === updateData.dateId);
        if (u && d) {
            updateCheckin({
                dateId: updateData.dateId,
                userId: u?.id ?? '',
                userCheckinList: [
                    ...(d?.userCheckinList ?? []),
                    {
                        remark: updateData.remark ?? '',
                        time: updateData.time ?? '',
                        email: u?.email,
                        googleId: u?.googleId ?? '',
                        reason: '',
                    },
                ],
            });
        }
    };
    const onApprove = async (data: UserCheckInList) => {
        const today = dayjs().format('YYYY-MM-D');
        const cc = dateList.find((f) => f.date === today);

        if (cc) {
            await updateUserCheckin(cc.id as string, data.id as string, [
                ...cc.userCheckinList,
                {
                    email: data.email,
                    googleId: data.googleId,
                    reason: data.reason,
                    remark: data.remark,
                    time: data.time,
                },
            ]);

            setOpen(true);
        }
    };

    const onChangeData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setUpdateData((prev) => ({
            ...prev,
            [e.target.name ?? '']: e.target.value,
        }));
    };
    const getCheckinData = async () => {
        // get all
        const res = await getCheckinTodayList();

        setCheckinList([...res.filter((f) => dayjs(Number(f.time)).isSame(dayjs(), 'day'))]);
    };
    useEffect(() => {
        getCheckinData();
    }, []);

    useEffect(() => {
        if (dateList.length > 0) {
            const currentDate = dayjs().format('D-MM-YYYY');
            const findData = dateList.find((f) => f.date === currentDate);
            if (findData) {
                setUpdateData((prev) => ({ ...prev, row: findData.id ?? '' }));
            }
        }
    }, [JSON.stringify(dateList)]);
    //
    return (
        <>
            <Box component={'form'} onSubmit={onSubmit}>
                <Box display='flex' gap={2} flexWrap='wrap' alignItems={'center'}>
                    <Grid container spacing={2}>
                        {/* Date (Disabled Select) */}
                        <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                            <FormControl disabled fullWidth>
                                <InputLabel id='date-label'>วันที่</InputLabel>
                                <Select labelId='date-label' name='dateId' value={updateData.dateId} onChange={onChangeData} label='วันที่'>
                                    <MenuItem value=''>select</MenuItem>
                                    {dateList.map((d, index) => (
                                        <MenuItem key={index} value={d.id}>
                                            {d.date}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Employee Select */}
                        <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                            <FormControl fullWidth>
                                <InputLabel id='employee-label'>พนักงาน</InputLabel>
                                <Select
                                    labelId='employee-label'
                                    name='userId'
                                    value={updateData.userId}
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
                                            required: true,
                                            error: !updateData.time,
                                            fullWidth: true,
                                        },
                                    }}
                                    onChange={(newValue) => {
                                        setUpdateData((prev) => ({
                                            ...prev,
                                            time: dayjs(newValue).format('HH:mm'),
                                        }));
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        {/* Note Input */}
                        <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                            <TextField fullWidth name='remark' label='หมายเหตุ' value={updateData.remark} onChange={onChangeData} />
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
            </Box>
            <Box marginTop={2}>
                {checkinList
                    .filter((f) => f.status === 99)
                    .map((c) => (
                        <Box key={c.googleId} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                            <Box>ชื่อ: {c.name}</Box>
                            <Box>เวลาเข้างาน: {dayjs(Number(c.time)).format('DD-MM-YYYY HH:mm')}</Box>
                            <Button size='small' loading={updating} variant='contained' color='success' onClick={() => onApprove(c)}>
                                อนุมัติ
                            </Button>
                        </Box>
                    ))}
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Sheet updated successfully
                </Alert>
            </Snackbar>
        </>
    );
}

export default UpdateUserCheckInFirebase;
