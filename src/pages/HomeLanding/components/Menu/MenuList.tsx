import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, Box, Grid, IconButton, Stack, useMediaQuery } from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import { useState } from 'react';
import Holiday from '../HolidayMenuBox';
import { TodayCheckIn } from '../TodayCheckIn';
import { LeaveRemainingMenuBox } from './LeaveRemainingMenuBox';
import { LeaveRequestMenuBox } from './LeaveRequestMenuBox';
import LogoutMenuBox from './LogoutMenuBox';
import ManageUserCheckinMenuBox from './ManageUserCheckinMenuBox';
import { SettingsMenuBox } from './SettingsMenuBox';
import WhoArrivedMenuBox from './WhoArrivedMenuBox';

export function MenuList() {
    const { profile } = useFirebase();
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    const [open, setOpen] = useState(true);

    return (
        <Box>
            {open && desktopSize && (
                <Alert
                    severity='warning'
                    iconMapping={{
                        warning: <CampaignIcon fontSize='inherit' />,
                    }}
                    action={
                        <IconButton
                            aria-label='close'
                            color='inherit'
                            size='small'
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            <CloseIcon fontSize='inherit' />
                        </IconButton>
                    }
                    sx={{ mb: 2 }}
                >
                    <AlertTitle>ประกาศ!!!!</AlertTitle>
                    เสื้อบริษัทใหม่ 2 ตัว ให้ใส่วันจันทร์กับวันศุกร์ เริ่ม 4 พ.ค.
                </Alert>
            )}
            {desktopSize && <TodayCheckIn />}
            <Stack spacing={1} direction={{ xs: 'column', lg: 'column-reverse' }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 8, lg: 6 }} display={'flex'}>
                        <LeaveRemainingMenuBox />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <LeaveRequestMenuBox />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <Holiday />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 3 }} display={'flex'}>
                        <WhoArrivedMenuBox />
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
