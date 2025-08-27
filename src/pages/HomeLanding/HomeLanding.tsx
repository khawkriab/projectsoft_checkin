import { ArrowBack, ArrowForward, ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import { AppBar, Box, Button, CardMedia, IconButton, Toolbar, Typography } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersCalendarHeaderProps, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DateTime from 'components/common/DateTime/DateTime';
import dayjs, { Dayjs } from 'dayjs';

export const STATUS = {
    TODAY: { code: 'TODAY', label: 'วันนี้', color: 'blue' },
    NORMAL: { code: 'NORMAL', label: 'ปกติ', color: 'green' },
    LATE: { code: 'LATE', label: 'สาย', color: 'orange' },
    LEAVE: { code: 'LEAVE', label: 'ลา', color: 'red' },
    HOLIDAY: { code: 'HOLIDAY', label: 'วันหยุด', color: 'gray' },
} as const;

type StatusCode = keyof typeof STATUS;

const statusMap: Record<string, StatusCode> = {
    [dayjs().format('YYYY-MM-DD')]: 'TODAY',
    '2025-08-28': 'NORMAL',
    '2025-08-29': 'LATE',
    '2025-08-30': 'LEAVE',
    '2025-08-31': 'HOLIDAY',
};

function HomeLanding() {
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                flexDirection: 'column',
            }}
        >
            <AppBar position='relative' sx={{ height: '75px' }}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: 60,
                            width: '100%',
                        }}
                    >
                        <Box display={'flex'} alignItems={'center'} gap={2}>
                            <Box borderRadius={'100%'} overflow={'hidden'}>
                                <CardMedia
                                    component='img'
                                    sx={{ width: 50 }}
                                    image={`${process.env.PUBLIC_URL}/images/logo/projectsoft-logo.png`}
                                    alt='logo'
                                />
                            </Box>
                            <Box>
                                <Typography variant='h5'>Projectsoft Check-In</Typography>
                            </Box>
                        </Box>
                        <Box>login</Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box className='body-content' padding={'12px'}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        marginBottom: '12px',
                    }}
                >
                    <Box>
                        <Box>
                            <span>วันนี้ </span>
                            <DateTime show='date' />
                        </Box>
                        <Box>
                            <span>เวลา </span>
                            <DateTime show='time' />
                        </Box>
                    </Box>
                    <Box>
                        <Button>check-in</Button>
                    </Box>
                </Box>
                <Box
                    sx={{
                        boxShadow: '0 0 10px 10px #bababa3b',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            value={dayjs()}
                            autoFocus={false}
                            // showDaysOutsideCurrentMonth
                            // fixedWeekNumber={6}
                            sx={{
                                '& .MuiPickersDay-root.Mui-selected, & .MuiPickersDay-root.Mui-selected:hover, , & .MuiPickersDay-root.Mui-selected:focus':
                                    {
                                        // color: 'inherit',
                                        // backgroundColor: 'inherit',
                                    },
                                '&.MuiDateCalendar-root': {
                                    width: '100%',
                                    // height: '68vh',
                                    height: 'auto',
                                    maxHeight: 'unset',
                                },
                                '& .MuiPickersSlideTransition-root': {
                                    // height: '60vh',
                                },
                                '& .MuiPickersDay-root': {
                                    // fontSize: '1.25rem',
                                    // width: 'calc(90vw / 7)',
                                    // height: 'calc(60vh / 7)',
                                    // width: 'calc(100% / 7)',
                                    // width: '100%',
                                    // borderRadius: 0,
                                    margin: 0,
                                    opacity: 1,
                                    // border: '1px solid #ccc',
                                },
                                '& .MuiDayCalendar-weekContainer': {
                                    margin: 0,
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    width: '100%',
                                    // backgroundColor: '#777',
                                },
                            }}
                            slots={{
                                calendarHeader: CustomCalendarHeader, // 👈 override header
                                day: (dayProps) => <CustomDay statusMap={statusMap} {...dayProps} />,
                            }}
                            // slots={{
                            //     day: (dayProps) => (
                            //         <ServerDay
                            //             {...dayProps}
                            //             role={profile?.role}
                            //             datesSelected={datesSelected}
                            //             onAddMarkWFH={(date: number, wfhFlag: boolean) => {
                            //                 if (profile?.role === 'ADMIN') {
                            //                     let n = [...datesSelected];
                            //                     const indexOfDate = n.findIndex((f) => f.date === date);

                            //                     if (indexOfDate >= 0) {
                            //                         n[indexOfDate].wfhFlag = wfhFlag;
                            //                     }

                            //                     setDatesSelected([...n]);
                            //                 }
                            //             }}
                            //         />
                            //     ),
                            // }}
                            // shouldDisableDate={(day) => {
                            //     const date = day.date();
                            //     const hasData = currentFromDatabase.filter((f) => f.userCheckinList.length > 0);
                            //     return hasData.map((m) => m.date).includes(date);
                            // }}
                            // onMonthChange={(m) => {
                            //     setMonth(m.get('months'));
                            //     setYears(m.get('years'));
                            // }}
                            // onChange={(newValue) => {
                            //     const date = newValue?.get('date') ?? 0;
                            //     if (date && profile?.role === 'ADMIN') {
                            //         let n = [...datesSelected];
                            //         const index = n.findIndex((f) => f.date === date);

                            //         if (index >= 0) {
                            //             n.splice(index, 1);
                            //         } else {
                            //             n.push({ date: date, wfhFlag: false, userCheckinList: [] });
                            //         }

                            //         setDatesSelected([...n]);
                            //     }
                            // }}
                        />
                    </LocalizationProvider>
                </Box>
                <Box>menu</Box>
            </Box>
        </Box>
    );
}

function CustomCalendarHeader(props: PickersCalendarHeaderProps) {
    const { currentMonth, onMonthChange } = props;

    const handlePrevMonth = () => {
        onMonthChange(dayjs(currentMonth.subtract(1, 'month'), 'left'));
    };

    const handleNextMonth = () => {
        onMonthChange(dayjs(currentMonth.add(1, 'month'), 'right'));
    };

    return (
        <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ px: 1, py: 1 }}>
            {/* Prev button (left) */}
            <IconButton sx={{ borderRadius: '100%', backgroundColor: '#e2e2e293' }} onClick={handlePrevMonth}>
                <ArrowBackIosNewRounded />
            </IconButton>

            {/* Month & Year (center) */}
            <Typography variant='subtitle1' fontWeight='bold'>
                {currentMonth.format('MMMM YYYY')}
            </Typography>

            {/* Next button (right) */}
            <IconButton sx={{ borderRadius: '100%', backgroundColor: '#e2e2e293' }} onClick={handleNextMonth}>
                <ArrowForwardIosRounded />
            </IconButton>
        </Box>
    );
}

function CustomDay(props: PickersDayProps & { statusMap: Record<string, StatusCode> }) {
    const { day, outsideCurrentMonth, ...other } = props;
    const key = day.format('YYYY-MM-DD');
    const statusCode = statusMap[key];
    const status = statusCode ? STATUS[statusCode] : null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 'calc(100% / 7)',
                // border: '1px solid #ccc',
            }}
        >
            <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
            {status && !outsideCurrentMonth && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                    {/* วงกลมสี */}
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: status.color,
                        }}
                    />
                    {/* label */}
                    <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
                        {status.label}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default HomeLanding;
