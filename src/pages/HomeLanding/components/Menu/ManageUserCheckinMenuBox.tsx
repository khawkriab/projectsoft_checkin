import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { NavLink } from 'react-router-dom';

function ManageUserCheckinMenuBox() {
    return (
        <NavLink to={'/manage/user-checkin'} style={{ flex: 'auto' }}>
            <MenuBox
                sx={(theme) => ({
                    minHeight: `${50 * 2}px`,
                    flex: 'auto',
                    // width: { xs: '100%', lg: '50%' },
                    bgcolor: theme.palette.mode === 'light' ? theme.palette.warning.main : 'transparent',
                    color: theme.palette.primary.contrastText,
                    justifyContent: 'center',
                    gap: '6px',
                    flexDirection: { xs: 'column-reverse', lg: 'row' },
                })}
            >
                <Typography>จัดการเวลาเข้างาน</Typography>
                <EventAvailableIcon sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
            </MenuBox>
        </NavLink>
    );
}

export default ManageUserCheckinMenuBox;
