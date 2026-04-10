import { Typography } from '@mui/material';
import { MenuBox } from './MenuBox';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useNavigate } from 'react-router-dom';

function WhoArrivedMenuBox() {
    const navigate = useNavigate();

    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: `${50 * 2}px`,
                flex: 'auto',
                // width: { xs: '100%', lg: '50%' },
                bgcolor: theme.palette.mode === 'light' ? '#F0D02E' : 'transparent',
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
                flexDirection: { xs: 'column-reverse', lg: 'row' },
                cursor: 'pointer',
            })}
            onClick={() => navigate('/user-checkin')}
        >
            <Typography>กำลังวิ่งมา</Typography>
            <DirectionsRunIcon sx={{ fontSize: { xs: '2.5rem', lg: '1.5rem' } }} />
        </MenuBox>
    );
}

export default WhoArrivedMenuBox;
