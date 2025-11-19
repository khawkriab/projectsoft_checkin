import { AppBar, Box, Button, CardMedia, Toolbar, Typography } from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import SwitchThemeModeButton from './SwitchThemeModeButton';

function HomeAppBar() {
    return (
        <AppBar
            position='relative'
            sx={{
                height: '75px',
                bgcolor: 'var(--main-accent)',
                boxShadow: '0 1px 10px #000000ce',
                // bgcolor: 'transparent',
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                    pl: '12px',
                    pr: '12px',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 60,
                        width: '100%',
                    }}
                >
                    <Box display={'flex'} alignItems={'center'} gap={2}>
                        <Box borderRadius={'100%'} overflow={'hidden'}>
                            <CardMedia
                                component='img'
                                sx={{ width: 50 }}
                                image={`${process.env.PUBLIC_URL}/images/logo/projectsoft-logo.png`}
                                alt='logo'
                            />
                        </Box>
                        <Box>
                            <Typography variant='h5'>Projectsoft Check-In</Typography>
                        </Box>
                    </Box>
                    <SwitchThemeModeButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default HomeAppBar;
