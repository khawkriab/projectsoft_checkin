import { ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { PickersCalendarHeaderProps } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export function CustomCalendarHeader(props: PickersCalendarHeaderProps) {
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
                <ArrowBackIosNewRounded sx={{ fontSize: '12px' }} />
            </IconButton>

            {/* Month & Year (center) */}
            <Typography variant='h5' fontWeight={600}>
                {currentMonth.format('MMMM YYYY')}
            </Typography>

            {/* Next button (right) */}
            <IconButton sx={{ borderRadius: '100%', backgroundColor: '#e2e2e293' }} onClick={handleNextMonth}>
                <ArrowForwardIosRounded sx={{ fontSize: '12px' }} />
            </IconButton>
        </Box>
    );
}
