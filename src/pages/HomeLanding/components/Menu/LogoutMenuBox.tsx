import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { useFirebase } from 'context/FirebaseProvider';

function LogoutMenuBox() {
    const { signOutUser } = useFirebase();

    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: `${50 * 2}px`,
                flex: 'auto',
                // width: { xs: '100%', lg: '50%' },
                bgcolor: theme.palette.mode === 'light' ? theme.palette.error.light : 'transparent',
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
                flexDirection: { xs: 'column-reverse', lg: 'row' },
                cursor: 'pointer',
            })}
            onClick={signOutUser}
        >
            <Typography>ออกจากระบบ</Typography>
            <PowerSettingsNewIcon sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
        </MenuBox>
    );
}

export default LogoutMenuBox;
