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
import { useEffect, useState } from 'react';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import { EmployeeData, SheetsDate } from 'pages/Home/HomeSheets';
import { DesktopTimePicker } from '@mui/x-date-pickers';

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
};

function UpdateUserCheckIn({ dateList = [], employeeList = [], afterUndate = () => {} }: UpdateUserCheckInProps) {
    const { auth2, isSignedIn } = useGoogleLogin();
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [updateSheetsData, setUpdateSheetsData] = useState<SheetsForm>({ row: '3', columnNumber: '1', remark: '' });
    //

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
                        range: `June!${columnDate}${sheetsData.row}`,
                        values: [[sheetsData.time]],
                    },
                    {
                        range: `June!${columnMark}${sheetsData.row}`,
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

    const onChangeData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        setUpdateSheetsData((prev) => ({
            ...prev,
            [e.target.name ?? '']: e.target.value,
        }));
    };

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
