import { Box, Button, Drawer, IconButton, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { TableBodyCell } from 'components/common/MuiTable';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/lab';

function Absent() {
    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    return (
        <Box>
            <Box display={'flex'} justifyContent={'end'}>
                <Button variant='contained' color='error' size='large' onClick={() => setOpen(true)}>
                    <Typography variant='h6'>เขียนใบลา</Typography>
                </Button>
            </Box>
            <Box>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableBodyCell>ประเภทการลา</TableBodyCell>
                                <TableBodyCell>รายละเอียด</TableBodyCell>
                                <TableBodyCell>วันที่-ระยะเวลา</TableBodyCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Drawer
                anchor='right'
                slotProps={{
                    paper: {
                        sx: {
                            width: '100%',
                            maxWidth: '500px',
                            boxSizing: 'border-box',
                        },
                    },
                }}
                open={open}
                onClose={() => setOpen(false)}
            >
                <Box display={'flex'} justifyContent={'flex-end'}>
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseIcon color='error' />
                    </IconButton>
                </Box>
                <Box>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateRangePicker />
                    </LocalizationProvider>
                </Box>
            </Drawer>
        </Box>
    );
}

export default Absent;
