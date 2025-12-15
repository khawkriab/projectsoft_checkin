import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { deleteWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import React from 'react';
import { CalendarDateList, CheckinDate, Profile } from 'type.global';

export type CalendarDateExtendText = Omit<CalendarDateList, 'userCheckinList'> & {
    userCheckinList: (
        | (CheckinDate & {
              statusText: string;
              lateFlag: number; // 0:not late, 1:late, 2:unknown
              timeText: string;
          })
        | null
    )[];
};

function CalendarTable({ userFilterList, calendarCheckin }: { userFilterList: Profile[]; calendarCheckin: CalendarDateExtendText[] }) {
    const statusStyle = (data: CalendarDateExtendText['userCheckinList'][0]) => {
        if (data?.lateFlag) {
            if (data.lateFlag === 1) {
                return {
                    color: '#ffffff',
                    textAlign: 'center',
                    backgroundColor: '#FBBC04',
                };
            }

            // data.lateFlag === 2 ***หาย
            return {
                color: '#ffffff',
                textAlign: 'center',
                backgroundColor: '#D32F2F',
            };
        }

        if (data?.absentId) {
            return {
                color: '#ffffff',
                textAlign: 'center',
                backgroundColor: '#FF9800',
            };
        }
        return {};
    };

    // const onDelete = async (d: CalendarDateExtendText['userCheckinList'][0]) => {
    //     if (!d?.id) return;

    //     await deleteWorkTime(d?.id);
    // };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableHeadRow>
                        <TableHeadCell
                            sx={{
                                borderLeft: '1px solid #fff',
                                borderRight: '1px solid #fff',
                                position: 'sticky',
                                left: 0,
                                zIndex: 2,
                                backgroundColor: 'primary.main',
                            }}
                        >
                            {'ชื่อพนักงาน'}
                        </TableHeadCell>
                        {userFilterList.map((user, index) => {
                            return (
                                <TableHeadCell key={index} colSpan={2} align='center' sx={{ borderLeft: '1px solid #fff' }}>
                                    {user.name}
                                </TableHeadCell>
                            );
                        })}
                    </TableHeadRow>
                    <TableHeadRow>
                        <TableHeadCell
                            sx={{
                                borderLeft: '1px solid #fff',
                                borderRight: '1px solid #fff',
                                position: 'sticky',
                                left: 0,
                                zIndex: 2,
                                backgroundColor: 'primary.main',
                            }}
                        >
                            {'วันที่'}
                        </TableHeadCell>
                        {userFilterList.map((_, index) => {
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
                    {calendarCheckin.map((row, rowIdx) => {
                        if (row.isHoliDay) return;

                        return (
                            <TableRow key={rowIdx}>
                                <TableBodyCell
                                    sx={(theme) => ({
                                        border: '1px solid',
                                        borderLeftColor: theme.palette.secondary.contrastText,
                                        borderRightColor: theme.palette.secondary.contrastText,
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 2,
                                        backgroundColor: 'background.paper',
                                    })}
                                >
                                    {row.date}
                                </TableBodyCell>
                                {row.userCheckinList.map((u, uIndex) => (
                                    <React.Fragment key={`${uIndex}-${u?.name}`}>
                                        {/* เวลาเข้าทำงาน */}
                                        <TableBodyCell
                                            sx={(theme) => ({
                                                border: '1px solid',
                                                borderLeftColor: theme.palette.secondary.contrastText,
                                            })}
                                        >
                                            {u?.timeText}
                                            <Box display={'inline-block'} color={'#ff6f00'} fontWeight={700}>
                                                {u?.remark && u?.timeText && ' - '}
                                                {u?.remark}
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
                                                    // backgroundColor: u?.lateFlag ? '#FBBC04' : u?.absentId ? '#FF9800' : '',
                                                    // color: u?.lateFlag || u?.absentId ? '#ffffff' : '',
                                                    // textAlign: u?.lateFlag || u?.absentId ? 'center' : '',
                                                    ...statusStyle(u),
                                                }}
                                            >
                                                {u?.statusText}
                                            </Box>
                                            <Box>{u?.reason}</Box>
                                            {/* <Button color='error' onClick={() => onDelete(u)}>
                                                delete
                                            </Button> */}
                                        </TableBodyCell>
                                    </React.Fragment>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CalendarTable;
