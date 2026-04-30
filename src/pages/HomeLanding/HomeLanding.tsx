import { Alert, AlertTitle, Box, Grid, IconButton } from '@mui/material';
import { TodayCheckIn } from './components/TodayCheckIn';
import CalendarCheckin from './components/CalendarCheckin';
import { CheckinHistory } from './components/CheckinHistory';
import { MenuList } from './components/Menu/MenuList';
import { UserCalendarProvider } from 'context/UserCalendarProvider';
import CampaignIcon from '@mui/icons-material/Campaign';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

function HomeLanding() {
    const [open, setOpen] = useState(true);

    return (
        <UserCalendarProvider>
            {/* date */}
            <Box display={{ xs: 'block', lg: 'none' }}>
                <Alert
                    slotProps={{
                        root: { sx: { p: '0 6px', mb: 2 } },
                    }}
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
                <TodayCheckIn />
            </Box>
            <Grid container spacing={2} direction={{ xs: 'column', lg: 'row' }}>
                {/* calendar */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <CalendarCheckin />
                    <CheckinHistory />
                </Grid>
                {/* menu */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MenuList />
                </Grid>
            </Grid>
        </UserCalendarProvider>
    );
}

export default HomeLanding;
