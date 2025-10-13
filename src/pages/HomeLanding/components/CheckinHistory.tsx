import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { MenuBox } from './MenuBox';
import dayjs from 'dayjs';
import { StatusBox } from './StatusBox';
import { useUserCalendarContext } from 'context/UserCalendarProvider';

export function CheckinHistory() {
    const { dateSelect, calendarDateList } = useUserCalendarContext();
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    // const arr = Object.values(data);
    const f = calendarDateList.find((r) => r?.date === dateSelect);

    return (
        <Stack sx={{ mt: { xs: 0, lg: '12px' } }}>
            {f && (
                <MenuBox minHeight={`${50 * 2}px`}>
                    <Box>
                        <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                            {dayjs(f?.date).format('LL')}
                        </Typography>
                        {f.checkinData?.time && <Typography>เข้า: {f.checkinData?.time}</Typography>}
                    </Box>
                    {f?.checkinData?.statusCode && <StatusBox status={f.checkinData.statusCode} showBackground />}
                </MenuBox>
            )}
            {desktopSize &&
                calendarDateList
                    .filter((fl) => !!fl.checkinData)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => (
                        <MenuBox key={m.date} minHeight={`${50 * 2}px`} mt={'12px'}>
                            <Box>
                                <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                                    {dayjs(m?.date).format('LL')}
                                </Typography>
                                {m.checkinData?.time && <Typography>เข้า: {m.checkinData?.time}</Typography>}
                            </Box>
                            {m?.checkinData?.statusCode && <StatusBox status={m.checkinData.statusCode} showBackground />}
                        </MenuBox>
                    ))}
        </Stack>
    );
}
