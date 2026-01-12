import { Box } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { cornerCurveStyle, StatusBox } from '../Menu/StatusBox';
import { UserCalendarCheckin } from 'context/UserCalendarProvider';
import { STATUS } from 'context/UserCalendarProvider/UserCalendarProvider';
import { CalendarDateConfig } from 'type.global';
import CelebrationTwoToneIcon from '@mui/icons-material/CelebrationTwoTone';
import EventTwoToneIcon from '@mui/icons-material/EventTwoTone';
import CakeTwoToneIcon from '@mui/icons-material/CakeTwoTone';

export function CustomDay({
    day,
    outsideCurrentMonth,
    calendarConfig,
    dataList,
    desktopSize,
    ...props
}: PickersDayProps & { dataList: UserCalendarCheckin[]; desktopSize?: boolean; calendarConfig: CalendarDateConfig[] }) {
    const key = day.format('YYYY-MM-DD');
    const data = dataList.find((f) => f.date === key);
    const status = data?.checkinData?.statusCode ? data?.checkinData?.statusCode : null;
    const dateConfig = calendarConfig.find((f) => f.date === key);
    const isStartOfWeek = day.isSame(day.startOf('week'), 'day');
    const isEndOfWeek = day.isSame(day.endOf('week'), 'day');

    return (
        <Box
            sx={() => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'calc(100% / 7)',
                aspectRatio: '1.2/1',
                // border: '1px solid #f00',
                paddingTop: { xs: '8px', md: '12px' },
                paddingBottom: { xs: '12px', md: '26px' },
                // border: '1px solid #ccc',
            })}
        >
            <PickersDay
                {...props}
                sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                disabled={isStartOfWeek || isEndOfWeek}
            />

            {dateConfig?.eventType && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: '6px',
                        left: '12px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-start',
                    }}
                >
                    {dateConfig?.eventType === 'HOLIDAY' && (
                        <CelebrationTwoToneIcon sx={{ color: '#ff00ea', fontSize: { xs: '16px', sm: '22px' } }} />
                    )}
                    {dateConfig?.eventType === 'BIRTHDAY' && (
                        <CakeTwoToneIcon sx={{ color: '#ff00ea', fontSize: { xs: '16px', sm: '22px' } }} />
                    )}
                    {dateConfig?.eventType === 'OTHER' && (
                        <EventTwoToneIcon sx={{ color: '#ff00ea', fontSize: { xs: '16px', sm: '22px' } }} />
                    )}
                </Box>
            )}
            {dateConfig && !dateConfig.isWFH && !dateConfig.isHoliDay && <Box sx={cornerCurveStyle(STATUS['WORK_DAY'].color)} />}
            {dateConfig?.isHoliDay && <Box sx={cornerCurveStyle(STATUS['HOLIDAY'].color)} />}
            {dateConfig?.isWFH && <Box sx={cornerCurveStyle(STATUS['WFH_DAY'].color)} />}
            {status && data?.checkinData?.status !== 99 && !outsideCurrentMonth && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {status && <StatusBox status={status} showBackground={desktopSize} showLabel={desktopSize} fontSize='12px' />}
                </Box>
            )}
        </Box>
    );
}
