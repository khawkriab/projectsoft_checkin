import { Box, IconButton, Paper, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { useNotification } from 'components/common/NotificationCenter';
import React from 'react';
import { CalendarDateList, CheckinDate, Profile } from 'type.global';
import HelpCenterTwoToneIcon from '@mui/icons-material/HelpCenterTwoTone';

export type CalendarDateExtendText = Omit<CalendarDateList, 'userCheckinList'> & {
    userCheckinList: (
        | (CheckinDate & {
              leaveTypeText: string;
              leavePeriodText: string;
              lateFlag: number; // 0:not late, 1:late, 2:unknown
              timeText: string;
              timeStatus: string;
              workOutsideText: string;
          })
        | null
    )[];
};

function CalendarTable({ userFilterList, calendarCheckin }: { userFilterList: Profile[]; calendarCheckin: CalendarDateExtendText[] }) {
    const { openNotify } = useNotification();

    const statusStyle = (data: CalendarDateExtendText['userCheckinList'][0]) => {
        if (data?.lateFlag) {
            if (data.lateFlag === 1) {
                return {
                    backgroundColor: '#FBBC04',
                };
            }

            // data.lateFlag === 2 ***หาย
            return {
                backgroundColor: '#D32F2F',
            };
        }

        return { color: '#ffffff', textAlign: 'center', backgroundColor: 'var(--status-normal-color)' };
    };

    // const onDelete = async (d: CalendarDateExtendText['userCheckinList'][0]) => {
    //     if (!d?.id) return;

    //     await deleteWorkTime(d?.id);
    // };

    return (
        <TableContainer component={Paper}>
            <Table
                sx={{
                    td: {
                        padding: '0 8px 8px 8px',
                    },
                }}
            >
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
                                <TableHeadCell key={index} rowSpan={2} align='center' sx={{ borderLeft: '1px solid #fff' }}>
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
                                                alignItems: 'flex-start',
                                            })}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography component={'span'}>{u?.timeText}</Typography>{' '}
                                                    {u?.timeStatus && (
                                                        <Box
                                                            sx={{
                                                                display: 'inline-block',
                                                                padding: '0 4px',
                                                                borderRadius: 1,
                                                                color: '#ffffff',
                                                                textAlign: 'center',
                                                                fontSize: '90%',
                                                                ...statusStyle(u),
                                                            }}
                                                        >
                                                            {u?.timeStatus}
                                                        </Box>
                                                    )}
                                                    <Box
                                                        sx={{
                                                            display: 'inline-block',
                                                            padding: '0 4px',
                                                            borderRadius: 1,
                                                            color: '#ffffff',
                                                            textAlign: 'center',
                                                            fontSize: '90%',
                                                            backgroundColor: '#FF9800',
                                                        }}
                                                    >
                                                        {u?.leaveTypeText}
                                                    </Box>
                                                </Box>
                                                {u?.device?.getUA && (
                                                    <IconButton
                                                        size='small'
                                                        sx={{
                                                            color: '#009dff',
                                                        }}
                                                        onClick={() => {
                                                            openNotify('info', u?.device?.getUA);
                                                        }}
                                                    >
                                                        <HelpCenterTwoToneIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                            <Box marginBottom={1}>
                                                <Box display={'inline-block'} color={'#ff6f00'} fontWeight={700}>
                                                    {u?.leavePeriodText}
                                                    {u?.workOutsideText}
                                                </Box>{' '}
                                                <Box display={'inline-block'}>{u?.remark}</Box>
                                                <Box display={'inline-block'}>{u?.reason}</Box>
                                            </Box>
                                            {u?.timeText && u?.latlng && (
                                                <Box>
                                                    <a
                                                        rel='noreferrer'
                                                        href={`https://www.google.com/maps?q=${u?.latlng?.lat},${u?.latlng?.lng}`}
                                                        target='_blank'
                                                    >
                                                        {`[${u?.latlng?.lat},${u?.latlng?.lng}]`}
                                                    </a>
                                                </Box>
                                            )}

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
