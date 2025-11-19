import { Box, Button } from '@mui/material';
import HomeAppBar from './HomeAppBar';
import { useFirebase } from 'context/FirebaseProvider';
import { Outlet } from 'react-router-dom';

function UserLayout() {
    const { authLoading, isSignedIn, profile, signInWithGoogle, signOutUser } = useFirebase();
    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                minHeight: '100vh',
                flexDirection: 'column',
                fontFamily: `'Sarabun', sans-serif`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: theme.palette.background.default,
                // CSS variables for status colors and backgrounds
                '--status-leave-color': '#FF9800',
                '--status-leave-bgc': '#FFE2C6',
                '--status-miss-color': '#D32F2F',
                '--status-miss-bgc': '#FFDBDC',
                '--status-late-color': '#FBBC04',
                '--status-late-bgc': '#FEF9C3',
                '--status-normal-color': '#34A853',
                '--status-normal-bgc': '#DCFCE7',
                '--status-holiday-color': '#000000',
                '--status-holiday-bgc': '#E0E0E0',
                '--status-work-day-color': theme.palette.primary.light,
                '--status-work-day-bgc': '#DCFCE7',
                '--status-wfh-day-color': '#ffa600',
                '--status-wfh-day-bgc': '#DCFCE7',
                '--main-accent': theme.palette.primary.main,
            })}
        >
            <HomeAppBar />
            <Box className='body-content' padding={{ xs: '12px', sm: '24px' }}>
                {!authLoading && profile && <Outlet />}
                {!authLoading && !profile && isSignedIn && (
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'80vh'}>
                        <Button variant='contained' color='primary' onClick={signInWithGoogle}>
                            Register with google
                        </Button>
                    </Box>
                )}
                {!authLoading && !profile && !isSignedIn && (
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'80vh'}>
                        <Button variant='contained' color='primary' onClick={signInWithGoogle}>
                            Signin with google
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default UserLayout;
