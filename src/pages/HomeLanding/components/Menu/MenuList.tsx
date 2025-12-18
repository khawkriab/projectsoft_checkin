import { Box, Grid, Stack, useMediaQuery } from '@mui/material';
import { TodayCheckIn } from '../TodayCheckIn';
import { LeaveRemainingMenuBox } from './LeaveRemainingMenuBox';
import { LeaveRequestMenuBox } from './LeaveRequestMenuBox';
import { SettingsMenuBox } from './SettingsMenuBox';
import ManageUserCheckinMenuBox from './ManageUserCheckinMenuBox';
import { useFirebase } from 'context/FirebaseProvider';
import LogoutMenuBox from './LogoutMenuBox';

export function MenuList() {
    const { profile } = useFirebase();
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    return (
        <Box>
            {desktopSize && <TodayCheckIn />}
            <Stack spacing={1} direction={{ xs: 'column', lg: 'column-reverse' }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 8, lg: 6 }} display={'flex'}>
                        <LeaveRemainingMenuBox />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <LeaveRequestMenuBox />
                    </Grid>
                    {(profile?.role === 'ADMIN' || profile?.role === 'STAFF' || profile?.role === 'ORGANIZATION') && (
                        <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                            <ManageUserCheckinMenuBox />
                        </Grid>
                    )}
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <SettingsMenuBox />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <LogoutMenuBox />
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}
