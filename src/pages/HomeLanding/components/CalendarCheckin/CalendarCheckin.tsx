import { Box, useMediaQuery } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { CustomCalendarHeader } from './CustomCalendarHeader';
import { CustomDay } from './CustomDay';
import { CheckinDataExtend } from 'pages/HomeLanding/HomeLanding';
import { StatusBox } from '../StatusBox';

function CalendarCheckin({
    checkInCalendar,
    dateSelect,
    setDateSelect,
}: {
    checkInCalendar: CheckinDataExtend;

    dateSelect: string;
    setDateSelect: (date: string) => void;
}) {
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    return (
        <Box
            sx={(theme) => ({
                // boxShadow: { xs: 'none', lg: '0 0 10px 10px #bababa3b' },
                boxShadow: { xs: 'none', lg: theme.palette.mode === 'light' ? '0 0 5px 2px #a0a0a03a' : 'none' },
                border: { xs: 'none', lg: '2px solid #bababa3b' },
                // backgroundColor: { xs: 'transparent', lg: '#ffffff' },
                backgroundColor: 'transparent',
                overflow: { xs: 'visible', lg: 'hidden' },
                borderRadius: '12px',
                // mb: '24px',
            })}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={dayjs(dateSelect)}
                    autoFocus={false}
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
                            padding: '12px',
                        },
                        '&.MuiDateCalendar-root': {
                            width: '100%',
                            height: 'auto',
                            maxHeight: 'unset',
                            overflow: 'visible',
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
                        calendarHeader: CustomCalendarHeader, // 👈 override header
                        day: (dayProps) => <CustomDay dataList={checkInCalendar} desktopSize={desktopSize} {...dayProps} />,
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
                    onChange={(newValue) => {
                        const date = newValue?.format('YYYY-MM-DD');
                        if (date) {
                            setDateSelect(date);
                        }
                    }}
                />
            </LocalizationProvider>
            {/* status */}
            <Box display={'flex'} gap={'12px'} padding={'12px'} justifyContent={{ xs: 'flex-start', lg: 'center' }}>
                <StatusBox
                    color={(theme) => theme.palette.text.primary}
                    dotColor='var(--status-normal-color)'
                    bgc='var(--status-normal-bgc)'
                    label='ปกติ'
                />
                <StatusBox
                    color={(theme) => theme.palette.text.primary}
                    dotColor='var(--status-late-color)'
                    bgc='var(--status-late-bgc)'
                    label='สาย'
                />
                <StatusBox
                    color={(theme) => theme.palette.text.primary}
                    dotColor='var(--status-leave-color)'
                    bgc='var(--status-leave-bgc)'
                    label='ลา'
                />
                <StatusBox
                    color={(theme) => theme.palette.text.primary}
                    dotColor='var(--status-holiday-color)'
                    bgc='var(--status-holiday-bgc)'
                    label='วันหยุด'
                />
                <StatusBox
                    color={(theme) => theme.palette.text.primary}
                    dotColor='var(--status-miss-color)'
                    bgc='var(--status-miss-bgc)'
                    label='ขาด'
                />
            </Box>
        </Box>
    );
}

export default CalendarCheckin;
