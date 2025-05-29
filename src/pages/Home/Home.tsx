import axios from 'axios';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { getColumnLetter } from 'helper/getColumnLetter';
import { Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { SheetData, UserCheckInData } from 'type.global';
import { UpdateUserCheckIn } from 'components/UpdateUserCheckIn';
import { UserCheckIn } from 'components/UserCheckIn';
import useLocation from 'hooks/useLocation';
import { LocationChecker } from 'components/common/LocationChecker';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

type UserCheckinData = {
    googleId: string;
    date: string;
    time: string;
    name: string;
    remark: string;
    status: string;
    lateFlag: number;
    absentFlag: number;
};

type CheckinData = {
    date: string;
    data: UserCheckinData[];
};
export type SheetsDate = { date: string; sheetsRowNumber: string };
export type EmployeeData = {
    googleId: string;
    name: string;
    sheetsColumn: string;
    sheetsColumnNumber: string;
};

function Home() {
    const { profile, auth2, authLoading, isSignedIn } = useGoogleLogin();
    const { isAllowLocation, lat, lng } = useLocation();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [dateList, setDateList] = useState<SheetsDate[]>([]);
    const [employeeList, setEmployeeList] = useState<EmployeeData[]>([]);
    const [checkinDataList, setCheckinDataList] = useState<CheckinData[]>([]);

    //
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
                const dateListSheets: SheetsDate[] = normalizedData
                    .slice(2)
                    .map((row, index) => ({ date: row[0], sheetsRowNumber: String(index + 3) }));

                // console.log('normalizedData:', normalizedData);
                setDateList([...dateListSheets]);
                // setUpdateSheetsData((prev) => ({ ...prev, row: rowSelect }));

                // set employee
                let _employeeList: EmployeeData[] = [];
                normalizedData[0].slice(1).forEach((col, index) => {
                    if (!col) return;

                    _employeeList.push({
                        googleId: col.includes('(') ? col.substring(col.indexOf('(') + 1, col.length - 1) : '',
                        name: col.includes('(') ? col.substring(0, col.indexOf('(')) : col,
                        sheetsColumn: getColumnLetter(index + 1),
                        sheetsColumnNumber: `${index + 1}`,
                    });
                });

                setEmployeeList([..._employeeList]);

                let n: CheckinData[] = [];
                normalizedData.slice(2).forEach((f, indexF) => {
                    const date = f[0]; // DD-MM-YYYY
                    n.push({
                        date: date,
                        data: [],
                    });
                    _employeeList.forEach((e, indexE) => {
                        const time = f[indexE * 3 + 1];
                        let remark = f[indexE * 3 + 3];
                        let status = f[indexE * 3 + 2]; // ตรงเวลา
                        let absentFlag = 0;
                        let lateFlag = 0;

                        if (time && dayjs(`${date} ${time}`, 'DD-MM-YYYY H:mm').isAfter(dayjs(`${date} 8:00`, 'DD-MM-YYYY H:mm'))) {
                            status = `สาย ${status} ชั่วโมง`;
                            lateFlag = 1;
                        } else if (!time && remark.includes('ลา')) {
                            status = remark;
                            remark = 'ลา';
                            absentFlag = 1;
                        } else if (!time && !remark && dayjs(`${date}`, 'DD-MM-YYYY').isBefore(dayjs().add(-1, 'day'))) {
                            status = 'หาย';
                            lateFlag = 1;
                        }

                        n[indexF].data.push({
                            googleId: e.googleId,
                            name: e.name,
                            date: f[0],
                            time: f[indexE * 3 + 1],
                            remark: remark,
                            status: status,
                            lateFlag: lateFlag,
                            absentFlag: absentFlag,
                        });
                    });
                });
                // console.log('n:', n);

                setCheckinDataList([...n]);
                setLoading(false); // Set loading to false
            })
            .catch((err) => {
                console.error('err:', err);
                // setError("Error fetching data from Google Sheets");
                setLoading(false);
            });
    };

    const getCheckin = async () => {
        const sheetsId = '1fMqyQw-JCm6ykyOgnfP--CtldfxAG27BNaegLjcrNK4';
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Today?key=${process.env.REACT_APP_API_KEY}`;

        // Fetch data from Google Sheets
        return axios
            .get<SheetData>(apiUrl)
            .then((response) => {
                const data = response.data.values;
                const maxLength = data[0].length;
                const normalizedData = data.map((row) => {
                    const rowCopy = [...row];
                    // Add empty strings for missing columns to match the first row length
                    while (rowCopy.length < maxLength) {
                        rowCopy.push('');
                    }
                    return rowCopy;
                });

                const n: UserCheckInData[] = normalizedData.slice(1).map((m) => ({
                    googleId: m[0],
                    time: m[1],
                    remark: m[2],
                    reason: m[3],
                    device: m[4],
                    latlng: m[5],
                    status: m[6],
                }));

                return n;
            })
            .catch((err) => {
                console.error('err:', err);

                return [];
            });
    };

    useEffect(() => {
        getSheets();
        // getCheckin();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* <LocationChecker /> */}
            <Box sx={{ marginBottom: 4 }}>
                {authLoading ? (
                    <div>Loading...</div>
                ) : (
                    isSignedIn && (
                        <>
                            {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                                <UpdateUserCheckIn
                                    dateList={dateList}
                                    employeeList={employeeList}
                                    afterUndate={getSheets}
                                    getCheckin={getCheckin}
                                />
                            )}
                            {/* {profile?.id && isAllowLocation && (isIOS || isAndroid) && isMobile && <UserCheckIn getCheckin={getCheckin} />} */}
                            {profile?.googleId && <UserCheckIn />}
                        </>
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
                                            {/* เวลาเข้าทำงาน */}
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                {u.time}
                                                <Box color={'#ff6f00'} fontWeight={700}>
                                                    {u.remark}
                                                </Box>
                                            </TableBodyCell>
                                            {/* สถานะ */}
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                <Box
                                                    sx={{
                                                        padding: '2px 4px',
                                                        borderRadius: 1,
                                                        backgroundColor: u.lateFlag ? '#f00' : u.absentFlag ? '#ff6f00' : '',
                                                        color: u.lateFlag || u.absentFlag ? '#ffffff' : '',
                                                        textAlign: u.lateFlag || u.absentFlag ? 'center' : '',
                                                    }}
                                                >
                                                    {u.status}
                                                </Box>
                                            </TableBodyCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
}

export default Home;
