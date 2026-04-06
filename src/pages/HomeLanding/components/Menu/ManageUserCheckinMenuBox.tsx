import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import { NavLink } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';

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
                <AssignmentIcon sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
            </MenuBox>
        </NavLink>
    );
}

export default ManageUserCheckinMenuBox;
