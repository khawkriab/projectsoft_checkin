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
import { EmployeeData, SheetsDate } from 'pages/Home/Home';
import { UserCheckInData } from 'type.global';
import { DesktopTimePicker } from '@mui/x-date-pickers';
import { getCheckinTodayList } from 'components/common/firebase/firebaseApi/checkinApi';

type SheetsForm = {
    row: string;
    columnNumber: string;
    time?: string;
    remark?: string;
};

type UpdateUserCheckInProps = {
    dateList: SheetsDate[];
    employeeList: EmployeeData[];
    afterUndate: () => Promise<void> | void;
    getCheckin: () => Promise<UserCheckInData[]>;
};

type UserCheckInList = UserCheckInData & EmployeeData;

function UpdateUserCheckIn({ dateList = [], employeeList = [], afterUndate = () => {}, getCheckin }: UpdateUserCheckInProps) {
    const { profile, auth2, authLoading, isSignedIn } = useGoogleLogin();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkinList, setCheckinList] = useState<UserCheckInList[]>([]);
    const [updateSheetsData, setUpdateSheetsData] = useState<SheetsForm>({ row: '3', columnNumber: '1', remark: '' });
    //
    const updateCheckin = async (data: SheetsForm, rowNumber: number) => {
        if (auth2) {
            const user = auth2.currentUser.get();
            const token = user.getAuthResponse().access_token;
            const sheetsId = '1fMqyQw-JCm6ykyOgnfP--CtldfxAG27BNaegLjcrNK4';
            const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`;

            const requestBody = {
                valueInputOption: 'USER_ENTERED', // or "RAW"
                data: [
                    {
                        range: `Today!G${rowNumber}`,
                        values: [['1']],
                    },
                ],
            };

            setUpdating(true);
            const response = await axios(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(requestBody),
            });

            if (response.status === 200) {
                getCheckinData(employeeList);
                updateSheets(data);
            } else {
                alert('Error updating the sheet');
                setUpdating(false);
            }
        }
    };
    const updateSheets = async (sheetsData: SheetsForm) => {
        if (isSignedIn && auth2) {
            const user = auth2.currentUser.get();
            const token = user.getAuthResponse().access_token;
            const spreadsheetId = process.env.REACT_APP_SHEETS_ID;
            const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
            const columnDate = getColumnLetter(Number(sheetsData.columnNumber));
            const columnMark = getColumnLetter(Number(sheetsData.columnNumber) + 2);

            const requestBody = {
                valueInputOption: 'USER_ENTERED', // or "RAW"
                data: [
                    {
                        range: `May!${columnDate}${sheetsData.row}`,
                        values: [[sheetsData.time]],
                    },
                    {
                        range: `May!${columnMark}${sheetsData.row}`,
                        values: [[sheetsData.remark]],
                    },
                ],
            };

            setUpdating(true);
            const response = await axios(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(requestBody),
            });

            if (response.status === 200) {
                await afterUndate();

                setOpen(true);
            } else {
                alert('Error updating the sheet');
            }
            setUpdating(false);
        }
    };
    const onSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateSheets(updateSheetsData);
    };
    const onApprove = (data: UserCheckInList) => {
        const indexOf = checkinList.findIndex((f) => f.googleId === data.googleId);
        updateCheckin(
            {
                row: updateSheetsData.row,
                columnNumber: data.sheetsColumnNumber,
                remark: data.remark,
                time: dayjs(Number(data.time)).format('HH:mm'),
            },
            indexOf + 2
        );
    };

    const onChangeData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setUpdateSheetsData((prev) => ({
            ...prev,
            [e.target.name ?? '']: e.target.value,
        }));
    };
    const getCheckinData = async (employeeList: EmployeeData[]) => {
        // const res = await getCheckin();
        const res = await getCheckinTodayList();
        console.log('res:', res);

        // const m: UserCheckInList[] = res.map((m) => {
        //     const findData = employeeList.find((f) => f.googleId === m.googleId);

        //     return { ...m, ...findData } as UserCheckInList;
        // });

        // setCheckinList([...m]);
    };
    useEffect(() => {
        if (employeeList.length > 0) {
            getCheckinData(employeeList);

            timer.current = setTimeout(() => {
                getCheckinData(employeeList);
            }, 6000 * 5);
        }

        return () => {
            clearInterval(timer.current);
        };
    }, [JSON.stringify(employeeList)]);

    useEffect(() => {
        if (dateList.length > 0) {
            const currentDate = dayjs().format('DD-MM-YYYY');
            const findData = dateList.find((f) => f.date === currentDate);
            if (findData) {
                setUpdateSheetsData((prev) => ({ ...prev, row: findData.sheetsRowNumber }));
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
                                <Select labelId='date-label' name='row' value={updateSheetsData.row} onChange={onChangeData} label='วันที่'>
                                    <MenuItem value=''>select</MenuItem>
                                    {dateList.map((d, index) => (
                                        <MenuItem key={index} value={d.sheetsRowNumber}>
                                            {d.date} ({getCellRange(index + 2, 0)})
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
                                    name='columnNumber'
                                    value={updateSheetsData.columnNumber}
                                    onChange={onChangeData}
                                    label='พนักงาน'
                                >
                                    <MenuItem value=''>select</MenuItem>
                                    {employeeList.map((employee, index) => (
                                        <MenuItem key={index} value={employee.sheetsColumnNumber}>
                                            {employee.name} {`(${employee.sheetsColumn})`}
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
                                            error: !updateSheetsData.time,
                                            fullWidth: true,
                                        },
                                    }}
                                    onChange={(newValue) => {
                                        setUpdateSheetsData((prev) => ({
                                            ...prev,
                                            time: dayjs(newValue).format('HH:mm'),
                                        }));
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        {/* Note Input */}
                        <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                            <TextField fullWidth name='remark' label='หมายเหตุ' value={updateSheetsData.remark} onChange={onChangeData} />
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
                    .filter((f) => f.status === '99')
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

export default UpdateUserCheckIn;
