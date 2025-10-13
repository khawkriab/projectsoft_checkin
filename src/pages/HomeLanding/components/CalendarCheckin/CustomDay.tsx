import { Box } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { StatusBox } from '../StatusBox';
import { UserCalendarCheckin } from 'context/UserCalendarProvider';
import { STATUS } from 'context/UserCalendarProvider/UserCalendarProvider';

export function CustomDay({
    day,
    outsideCurrentMonth,
    dataList,
    desktopSize,
    ...props
}: PickersDayProps & { dataList: UserCalendarCheckin[]; desktopSize?: boolean }) {
    const key = day.format('YYYY-MM-DD');
    const data = dataList.find((f) => f.date === key);
    const status = data?.checkinData?.statusCode ? data?.checkinData?.statusCode : null;
    const isStartOfWeek = day.isSame(day.startOf('week'), 'day');
    const isEndOfWeek = day.isSame(day.endOf('week'), 'day');

    return (
        <Box
            sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 'calc(100% / 7)',
                paddingTop: { xs: '12px', md: '24px' },
                paddingBottom: { xs: '12px', md: '24px' },
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
            {data && !data.isWFH && !data.isHoliDay && (
                <Box
                    sx={(theme) => ({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderTop: `10px solid ${STATUS['WORK_DAY'].color}`,
                        borderRight: '10px solid transparent',
                    })}
                />
            )}
            {data?.isHoliDay && (
                <Box
                    sx={(theme) => ({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderTop: `10px solid ${STATUS['HOLIDAY'].color}`,
                        borderRight: '10px solid transparent',
                    })}
                />
            )}
            {data?.isWFH && (
                <Box
                    sx={(theme) => ({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderTop: `10px solid ${STATUS['WFH_DAY'].color}`,
                        borderRight: '10px solid transparent',
                    })}
                />
            )}
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
