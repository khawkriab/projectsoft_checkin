import { Box, Grid, Stack, useMediaQuery } from '@mui/material';
import { TodayCheckIn } from './TodayCheckIn';
import { LeaveRemainingMenuBox } from './LeaveRemainingMenuBox';
import { LeaveRequestMenuBox } from './LeaveRequestMenuBox';
import { SettingsMenuBox } from './SettingsMenuBox';

export function MenuList() {
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    return (
        <Box>
            {desktopSize && <TodayCheckIn />}
            <Stack spacing={1} direction={{ xs: 'column', lg: 'column-reverse' }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 8, lg: 6 }} display={'flex'}>
                        <LeaveRemainingMenuBox />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 6 }}>
                        <Stack spacing={1} direction={{ xs: 'column', lg: 'row' }} height={'100%'}>
                            <LeaveRequestMenuBox />
                            <SettingsMenuBox />
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}
