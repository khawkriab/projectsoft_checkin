import { Box } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { CheckinDataExtend, STATUS } from 'pages/HomeLanding/HomeLanding';
import { StatusBox } from '../StatusBox';

export function CustomDay({
    day,
    outsideCurrentMonth,
    dataList,
    desktopSize,
    ...props
}: PickersDayProps & { dataList: CheckinDataExtend; desktopSize?: boolean }) {
    const key = day.format('YYYY-MM-DD');
    const data = dataList[key];
    const status = data?.statusCode ? STATUS[data.statusCode] : null;

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 'calc(100% / 7)',
                paddingBottom: { xs: '12px', md: '24px' },
                // border: '1px solid #ccc',
            })}
        >
            <PickersDay
                {...props}
                sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
            />
            {status && data?.status !== 99 && !outsideCurrentMonth && (
                <StatusBox
                    label={status.label}
                    dotColor={status.color}
                    bgc={status.bgc}
                    showBackground={desktopSize}
                    showLabel={desktopSize}
                />
            )}
        </Box>
    );
}
