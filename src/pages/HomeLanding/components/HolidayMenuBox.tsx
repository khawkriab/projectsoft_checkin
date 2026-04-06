import { getCalendarHoliday } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { CalendarDateConfig } from 'type.global';
import { MenuBox } from './Menu/MenuBox';
import EventIcon from '@mui/icons-material/Event';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

function HolidayMenuBox() {
    const [open, setOpen] = useState(false);
    const [holidayList, setHolidayList] = useState<{ month: string; holidayList: CalendarDateConfig[] }[]>([]);
    //
    const getHolidayList = async () => {
        const currentYears = dayjs().get('year');
        try {
            Promise.all([
                getCalendarHoliday(`${currentYears}-1`),
                getCalendarHoliday(`${currentYears}-2`),
                getCalendarHoliday(`${currentYears}-3`),
                getCalendarHoliday(`${currentYears}-4`),
                getCalendarHoliday(`${currentYears}-5`),
                getCalendarHoliday(`${currentYears}-6`),
                getCalendarHoliday(`${currentYears}-7`),
                getCalendarHoliday(`${currentYears}-8`),
                getCalendarHoliday(`${currentYears}-9`),
                getCalendarHoliday(`${currentYears}-10`),
                getCalendarHoliday(`${currentYears}-11`),
                getCalendarHoliday(`${currentYears}-12`),
            ]).then((holidayPerMonth) => {
                setHolidayList([...holidayPerMonth]);
            });
        } catch (error) {
            console.error('error:', error);
        }
    };

    useEffect(() => {
        if (open) getHolidayList();
    }, [open]);

    return (
        <>
            <MenuBox
                onClick={() => setOpen(true)}
                sx={(theme) => ({
                    minHeight: `${50 * 2}px`,
                    flex: 'auto',
                    bgcolor: theme.palette.mode === 'light' ? '#ff00ea' : 'transparent',
                    color: theme.palette.primary.contrastText,
                    justifyContent: 'center',
                    gap: '6px',
                    flexDirection: { xs: 'column-reverse', lg: 'row' },
                    cursor: 'pointer',
                })}
            >
                <Typography>วันหยุด</Typography>
                <EventIcon sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
            </MenuBox>
            {/* ---------------------------------  --------------------------------- */}
            <Drawer
                anchor='right'
                slotProps={{
                    paper: {
                        sx: {
                            width: '100%',
                            maxWidth: '600px',
                            boxSizing: 'border-box',
                            padding: { xs: 1, sm: 3 },
                        },
                    },
                }}
                open={open}
                // open
                onClose={() => setOpen(false)}
            >
                <Box display={'flex'} justifyContent={'space-between'}>
                    <Typography variant='h5'>วันหยุดประจำปี {dayjs().format('BBBB')}</Typography>
                    <IconButton onClick={() => setOpen(false)}>
                        <Close color='error' />
                    </IconButton>
                </Box>
                <hr style={{ width: '100%', margin: '12px 0 24px' }} />
                {/* Content */}
                <Box>
                    {holidayList.map((m) => {
                        if (m.holidayList.length <= 0) return null;

                        return (
                            <Box key={m.month} marginBottom={2}>
                                <Typography variant='h5' color='primary'>
                                    {dayjs(m.month).format('MMMM BBBB')}
                                </Typography>
                                <Box paddingLeft={2} paddingTop={1}>
                                    {m.holidayList.map((h) => (
                                        <Box key={h.date}>
                                            {dayjs(h.date).format('วันddddที่ D MMMM BBBB')}:{' '}
                                            <Typography component={'span'} sx={{ color: '#555555' }}>
                                                {h.remark}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Drawer>
        </>
    );
}

export default HolidayMenuBox;
