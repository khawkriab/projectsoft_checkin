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
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { CheckinCalendar, Profile, UserCheckInData, UserCheckinList } from 'type.global';
import { DesktopTimePicker } from '@mui/x-date-pickers';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { getCheckinTodayList, updateUserCheckin } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';

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
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<UserCheckInList[]>([]);
    const [updateData, setUpdateData] = useState<FormData>({ dateId: '', userId: '', remark: '' });
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
        const u = userList.find((f) => f.id === updateData.userId);
        const d = dateList.find((f) => f.id === updateData.dateId);
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
                dateId: updateData.dateId,
                userId: '',
                userCheckinList: [
                    ...userCheckinList,
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
        const today = dayjs().format('DD-MM-YYYY');
        const cc = dateList.find((f) => f.date === today);

        if (cc) {
            setUpdating(true);
            await updateUserCheckin(cc.id as string, data.id as string, [
                ...cc.userCheckinList,
                {
                    email: data.email,
                    googleId: data.googleId,
                    reason: data.reason,
                    remark: data.remark,
                    time: dayjs(Number(data.time)).format('HH:mm'),
                },
            ]);
            await afterUndate();
            await getCheckinData();
            setUpdating(false);
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
        console.log('res:', res);

        setCheckinList([...res.filter((f) => f.status === 99 && dayjs(Number(f.time)).isSame(dayjs(), 'day'))]);
    };
    useEffect(() => {
        getCheckinData();
    }, []);

    useEffect(() => {
        if (dateList.length > 0) {
            const currentDate = dayjs().format('DD-MM-YYYY');
            const findData = dateList.find((f) => f.date === currentDate);
            if (findData) {
                setUpdateData((prev) => ({ ...prev, dateId: findData.id ?? '' }));
            }
        }
    }, [JSON.stringify(dateList)]);
    //
    return (
        <>
            <Box component={'form'} onSubmit={onSubmit}>
                <Grid container spacing={2} marginTop={3}>
                    {/* Date (Disabled Select) */}
                    <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
                        <FormControl
                            disabled
                            // disabled
                            fullWidth
                        >
                            <InputLabel id='date-label'>วันที่</InputLabel>
                            <Select labelId='date-label' name='dateId' value={updateData.dateId} onChange={onChangeData} label='วันที่'>
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
                                        required: !updateData.time && !updateData.remark,
                                        error: !updateData.time && !updateData.remark,
                                        fullWidth: true,
                                    },
                                }}
                                onChange={(newValue) => {
                                    setUpdateData((prev) => ({
                                        ...prev,
                                        time: newValue ? dayjs(newValue).format('HH:mm') : '',
                                    }));
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    {/* Note Input */}
                    <Grid size={{ xs: 12, sm: 6, md: 'grow' }}>
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
            {checkinList.length > 0 && (
                <Box marginTop={2}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableHeadRow>
                                    <TableHeadCell>ชื่อ</TableHeadCell>
                                    <TableHeadCell>เวลาเข้างาน</TableHeadCell>
                                    <TableHeadCell>หมายเหตุ</TableHeadCell>
                                    <TableHeadCell>เหตุผล</TableHeadCell>
                                    <TableHeadCell>รายละเอียด</TableHeadCell>
                                    <TableHeadCell>#</TableHeadCell>
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {checkinList.map((c) => (
                                    <TableRow key={c.googleId}>
                                        <TableBodyCell>{c.name}</TableBodyCell>
                                        <TableBodyCell>{dayjs(Number(c.time)).format('DD-MM-YYYY HH:mm')}</TableBodyCell>
                                        <TableBodyCell>{c.remark}</TableBodyCell>
                                        <TableBodyCell>{c.reason}</TableBodyCell>
                                        <TableBodyCell>
                                            {`${c.device?.osName}-${c.device?.browserName}`}
                                            <br />
                                            {`[${c.latlng.lat},${c.latlng.lng}]`}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <Button
                                                size='small'
                                                loading={updating}
                                                variant='contained'
                                                color='success'
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
        </>
    );
}

export default UpdateUserCheckInFirebase;
