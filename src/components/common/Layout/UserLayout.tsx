import { Box, Button } from '@mui/material';
import HomeAppBar from './HomeAppBar';
import { useFirebase } from 'context/FirebaseProvider';
import { Outlet } from 'react-router-dom';

function UserLayout() {
    const { authLoading, isSignedIn, profile, signInWithGoogle, signOutUser, onRegister } = useFirebase();
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
            })}
        >
            <HomeAppBar />
            <Box className='body-content' padding={{ xs: '12px', sm: '24px' }}>
                {!authLoading && profile && <Outlet />}
                {!authLoading && !profile && isSignedIn && (
                    <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} height={'80vh'} gap={3}>
                        <Button variant='contained' color='primary' onClick={onRegister}>
                            Register with google
                        </Button>
                        <Button variant='contained' color='error' onClick={signOutUser}>
                            Logout
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
