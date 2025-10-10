import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import { SettingsOutlined } from '@mui/icons-material';

export function SettingsMenuBox() {
    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: '50px',
                flex: 'auto',
                width: { xs: '100%', lg: '50%' },
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
            })}
        >
            <Typography>ตั้งค่า</Typography>
            <SettingsOutlined />
        </MenuBox>
    );
}
