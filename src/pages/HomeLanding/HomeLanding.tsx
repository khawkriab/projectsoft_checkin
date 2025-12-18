import { Box, Grid } from '@mui/material';
import { TodayCheckIn } from './components/TodayCheckIn';
import CalendarCheckin from './components/CalendarCheckin';
import { CheckinHistory } from './components/CheckinHistory';
import { MenuList } from './components/Menu/MenuList';
import { UserCalendarProvider } from 'context/UserCalendarProvider';

function HomeLanding() {
    return (
        <UserCalendarProvider>
            {/* date */}
            <Box display={{ xs: 'block', lg: 'none' }}>
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
