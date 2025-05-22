import axios from 'axios';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useGoogleLogin } from 'components/GoogleLoginProvider';
import { getCellRange, getColumnLetter } from 'helper/getColumnLetter';
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Slide,
    Snackbar,
    SnackbarCloseReason,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/MuiTable';
import { deviceDetect } from 'react-device-detect';
import { SheetData } from 'type.global';

type UserCheckinData = {
    id: string;
    date: string;
    time: string;
    name: string;
    status: string;
    sheetsColumn: string;
    sheetsRowNumber: string;
};

type CheckinData = {
    date: string;
    data: UserCheckinData[];
};
type EmployeeData = {
    id: string;
    name: string;
    sheetsColumn: string;
    sheetsColumnNumber: string;
};

function Home() {
    const { auth2, authLoading, isSignedIn } = useGoogleLogin();
    //
    const [sheetData, setSheetData] = useState<string[][]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState(false);
    const [dateList, setDateList] = useState<string[]>([]);
    const [employeeList, setEmployeeList] = useState<EmployeeData[]>([]);
    const [open, setOpen] = useState(false);
    const [checkinDataList, setCheckinDataList] = useState<CheckinData[]>([]);

    const [updateSheetsData, setUpdateSheetsData] = useState<{
        row: string;
        column: string;
        time?: string;
        remark?: string;
    }>({ row: '3', column: '1', remark: '' });

    //
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const updateSheet = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSignedIn && auth2) {
            const user = auth2.currentUser.get();
            const token = user.getAuthResponse().access_token;
            const spreadsheetId = process.env.REACT_APP_SHEETS_ID;
            const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
            const columnDate = getColumnLetter(Number(updateSheetsData.column));
            const columnMark = getColumnLetter(Number(updateSheetsData.column) + 2);
            console.log('updateSheetsData:', updateSheetsData);
            const requestBody = {
                valueInputOption: 'USER_ENTERED', // or "RAW"
                data: [
                    {
                        range: `May!${columnDate}${updateSheetsData.row}`,
                        values: [[updateSheetsData.time]],
                    },
                    {
                        range: `May!${columnMark}${updateSheetsData.row}`,
                        values: [[updateSheetsData.remark]],
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
                await getSheets();
            } else {
                alert('Error updating the sheet');
            }
            setUpdating(false);
            setOpen(true);
        }
    };

    const onChangeData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        console.log('e.target.value:', e.target.value);
        setUpdateSheetsData((prev) => ({
            ...prev,
            [e.target.name ?? '']: e.target.value,
        }));
    };

    const getSheets = async () => {
        // API URL and your API key
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SHEETS_ID}/values/May?key=${process.env.REACT_APP_API_KEY}`;

        // Fetch data from Google Sheets
        axios
            .get<SheetData>(apiUrl)
            .then((response) => {
                const data = response.data.values;
                const maxLength = data[1].length;
                const normalizedData = data.map((row) => {
                    const rowCopy = [...row];
                    // Add empty strings for missing columns to match the first row length
                    while (rowCopy.length < maxLength) {
                        rowCopy.push('');
                    }
                    return rowCopy;
                });
                const dateListSheets = normalizedData.slice(2).map((row) => row[0]);
                const currentDate = dayjs().format('DD-MM-YYYY');
                const indexOfList = dateListSheets.findIndex((f) => f === currentDate);
                const rowSelect = String(indexOfList + 3);

                setSheetData(normalizedData); // Set the sheet data
                console.log('normalizedData:', normalizedData);
                setDateList([...dateListSheets]);
                setUpdateSheetsData((prev) => ({ ...prev, row: rowSelect }));

                // set employee
                let _employeeList: EmployeeData[] = [];
                normalizedData[0].slice(1).forEach((col, index) => {
                    if (!col) return;

                    _employeeList.push({
                        id: col.includes('(') ? col.substring(col.indexOf('(') + 1, col.length - 1) : '',
                        name: col.includes('(') ? col.substring(0, col.indexOf('(')) : col,
                        sheetsColumn: getColumnLetter(index + 1),
                        sheetsColumnNumber: `${index + 1}`,
                    });
                });

                setEmployeeList([..._employeeList]);
                console.log('_employeeList:', _employeeList);

                let n: CheckinData[] = [];

                normalizedData.slice(2).forEach((f, indexF) => {
                    n.push({
                        date: f[0],
                        data: [],
                    });
                    _employeeList.forEach((e, indexE) => {
                        n[indexF].data.push({
                            id: e.id,
                            name: e.name,
                            date: f[0],
                            time: f[indexE * 3 + 1],
                            status: `เข้างาน: ${f[indexE * 3 + 2]}${f[indexE * 3 + 3] ? `<br/>หมายเหตุ: ${f[indexE * 3 + 3]}` : ''}`,
                            sheetsColumn: e.sheetsColumn,
                            sheetsRowNumber: `${indexF + 3}`,
                        });
                    });
                });
                console.log('n:', n);

                setCheckinDataList([...n]);
                setLoading(false); // Set loading to false
            })
            .catch((err) => {
                console.error('err:', err);
                // setError("Error fetching data from Google Sheets");
                setLoading(false);
            });
    };

    useEffect(() => {
        getSheets();
        console.log('deviceDetect:', deviceDetect(undefined));
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Box sx={{ marginBottom: 3 }}>
                {authLoading ? (
                    <div>Loading...</div>
                ) : (
                    isSignedIn && (
                        <Box component={'form'} onSubmit={updateSheet}>
                            <Box display='flex' gap={2} flexWrap='wrap' alignItems={'center'}>
                                <Grid container spacing={2}>
                                    {/* Date (Disabled Select) */}
                                    <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
                                        <FormControl disabled fullWidth>
                                            <InputLabel id='date-label'>วันที่</InputLabel>
                                            <Select
                                                labelId='date-label'
                                                name='row'
                                                value={updateSheetsData.row}
                                                onChange={onChangeData}
                                                label='วันที่'
                                            >
                                                <MenuItem value=''>select</MenuItem>
                                                {dateList.map((date, index) => (
                                                    <MenuItem key={index} value={String(index + 3)}>
                                                        {date} ({getCellRange(index + 2, 0)})
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
                                                name='column'
                                                value={updateSheetsData.column}
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
                                            <TimePicker
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
                                        <TextField
                                            fullWidth
                                            name='remark'
                                            label='หมายเหตุ'
                                            value={updateSheetsData.remark}
                                            onChange={onChangeData}
                                        />
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
                    )
                )}
            </Box>
            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'ชื่อพนักงาน'}</TableHeadCell>
                                {employeeList.map((employee, index) => {
                                    return (
                                        <TableHeadCell key={index} colSpan={2} align='center' sx={{ borderLeft: '1px solid #fff' }}>
                                            {employee.name}
                                        </TableHeadCell>
                                    );
                                })}
                            </TableHeadRow>
                            <TableHeadRow>
                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'วันที่'}</TableHeadCell>
                                {employeeList.map((_, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'เวลาเข้าทำงาน'}</TableHeadCell>
                                            <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'สถานะ'}</TableHeadCell>
                                        </React.Fragment>
                                    );
                                })}
                                {/* {sheetData[1].length > 0 &&
                                    sheetData[1]?.map((col, index) => (
                                        <TableHeadCell key={index} sx={{ borderLeft: '1px solid #fff' }}>
                                            {col}
                                        </TableHeadCell>
                                    ))} */}
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            {checkinDataList.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableBodyCell
                                        sx={(theme) => ({
                                            border: '1px solid',
                                            borderLeftColor: theme.palette.secondary.contrastText,
                                        })}
                                    >
                                        {row.date}
                                    </TableBodyCell>
                                    {row.data.map((u) => (
                                        <React.Fragment key={u.name}>
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                {u.time}
                                            </TableBodyCell>
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: u.status }} />
                                            </TableBodyCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            ))}
                            {/* {sheetData.slice(2).map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    {row.map((cell, cellIdx) => (
                                        <TableBodyCell
                                            key={cellIdx}
                                            sx={(theme) => ({
                                                border: '1px solid',
                                                borderLeftColor: theme.palette.secondary.contrastText,
                                            })}
                                        >
                                            {cell}
                                        </TableBodyCell>
                                    ))}
                                </TableRow>
                            ))} */}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Sheet updated successfully
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Home;
