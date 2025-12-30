import { Box, useMediaQuery } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { CustomCalendarHeader } from './CustomCalendarHeader';
import { CustomDay } from './CustomDay';
import { StatusBox } from '../Menu/StatusBox';
import { useUserCalendarContext } from 'context/UserCalendarProvider';
import th from 'dayjs/locale/th';

dayjs.locale(th);

function CalendarCheckin() {
    const { dateSelect, calendarDateList, calendarConfig, onSelectDate, getUserCheckin } = useUserCalendarContext();
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    const weeklyShowHeader = useMediaQuery((t) => t.breakpoints.down('md'));
    return (
        <Box
            sx={(theme) => ({
                boxShadow: { xs: 'none', lg: theme.palette.mode === 'light' ? '0 0 5px 2px #a0a0a03a' : 'none' },
                border: { xs: 'none', lg: '2px solid #bababa3b' },
                backgroundColor: 'transparent',
                overflow: { xs: 'visible', lg: 'hidden' },
                borderRadius: '12px',
            })}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='th-TH'>
                <DateCalendar
                    value={dayjs(dateSelect)}
                    autoFocus={false}
                    dayOfWeekFormatter={(date) => date.format(weeklyShowHeader ? 'dd' : 'ddd')} // Sunday, Monday, ...
                    // showDaysOutsideCurrentMonth
                    // fixedWeekNumber={6}
                    sx={(theme) => ({
                        '.MuiDayCalendar-root': {
                            // boxShadow: { xs: '0 0 10px 10px #bababa3b', lg: 'none' },
                            boxShadow: { xs: theme.palette.mode === 'light' ? '0 0 5px 2px #a0a0a03a' : 'none', lg: 'none' },
                            border: { xs: '2px solid #bababa3b', lg: 'none' },
                            backgroundColor: 'transparent',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginTop: '12px',
                            padding: { xs: 0, md: '12px' },
                        },
                        '&.MuiDateCalendar-root': {
                            width: '100%',
                            height: 'auto',
                            maxHeight: 'unset',
                            overflow: 'visible',

                            '.MuiDayCalendar-monthContainer': {
                                position: 'relative',
                            },
                        },

                        '& .MuiPickersDay-root': {
                            margin: 0,
                            opacity: 1,
                        },
                        '& .MuiDayCalendar-weekContainer': {
                            margin: 0,
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            width: '100%',
                            paddingTop: '12px',
                            paddingBottom: '24px',
                            minHeight: '40px',
                            height: 'auto',
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: theme.typography.h6.fontSize,
                        },
                    })}
                    slots={{
                        calendarHeader: (headerProps) => (
                            <CustomCalendarHeader
                                {...headerProps}
                                onMonthChange={(date) => {
                                    getUserCheckin(date, date);
                                }}
                            />
                        ),
                        day: (dayProps) => (
                            <CustomDay
                                calendarConfig={calendarConfig}
                                dataList={calendarDateList}
                                desktopSize={desktopSize}
                                {...dayProps}
                            />
                        ),
                    }}
                    onChange={(newValue) => {
                        const date = newValue?.format('YYYY-MM-DD');
                        if (date) {
                            onSelectDate(date);
                        }
                    }}
                />
            </LocalizationProvider>
            {/* status */}
            <Box sx={{ padding: { xs: '12px 0', md: '12px' } }}>
                <Box display={'flex'} gap={'12px'} justifyContent={{ xs: 'flex-start', lg: 'center' }} flexWrap={'wrap'}>
                    <StatusBox color={(theme) => theme.palette.text.primary} shape='triangle' status='WORK_DAY' />
                    <StatusBox color={(theme) => theme.palette.text.primary} shape='triangle' status='HOLIDAY' />
                    <StatusBox color={(theme) => theme.palette.text.primary} shape='triangle' status='WFH_DAY' />
                </Box>
                <Box display={'flex'} gap={'12px'} justifyContent={{ xs: 'flex-start', lg: 'center' }} flexWrap={'wrap'}>
                    <StatusBox color={(theme) => theme.palette.text.primary} status='NORMAL' />
                    <StatusBox color={(theme) => theme.palette.text.primary} status='LATE' />
                    <StatusBox color={(theme) => theme.palette.text.primary} status='LEAVE' />
                    <StatusBox color={(theme) => theme.palette.text.primary} status='ABSENT' />
                </Box>
            </Box>
        </Box>
    );
}

export default CalendarCheckin;
