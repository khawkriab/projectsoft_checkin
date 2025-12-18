import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import { SettingsOutlined } from '@mui/icons-material';

export function SettingsMenuBox() {
    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: `${50 * 2}px`,
                flex: 'auto',
                // width: { xs: '100%', lg: '50%' },
                bgcolor: theme.palette.mode === 'light' ? theme.palette.primary.light : 'transparent',
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
                flexDirection: { xs: 'column-reverse', lg: 'row' },
                cursor: 'pointer',
            })}
        >
            <Typography>ตั้งค่า</Typography>
            <SettingsOutlined sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
        </MenuBox>
    );
}
