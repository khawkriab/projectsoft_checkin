import { AppBar, Avatar, Box, Button, CardMedia, Divider, Drawer, Grid, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useFirebase } from 'context/FirebaseProvider';
import SwitchThemeModeButton from './SwitchThemeModeButton';

function MenuItem({ children, to, onClick = () => {} }: { to: string; children: React.ReactNode; onClick?: () => void }) {
    const location = useLocation();

    return (
        <Box
            sx={(theme) => ({
                borderBottom: '3px solid #ffffff',
                borderColor:
                    location.pathname === to
                        ? {
                              xs: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                              md: '#ffffff',
                          }
                        : 'transparent',
            })}
        >
            <NavLink to={to} onClick={onClick}>
                <Typography
                    sx={(theme) => ({ color: { xs: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main, md: '#fff' } })}
                    margin={0}
                    variant='h5'
                >
                    {children}
                </Typography>
            </NavLink>
        </Box>
    );
}

function Layout() {
    const { authLoading, isSignedIn, profile, signInWithGoogle, signOutUser } = useFirebase();

    const [open, setOpen] = useState(false);

    const toggleDrawer = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const menuData = [
        {
            condition: true,
            label: 'Home',
            to: '/manage',
        },
        {
            condition:
                !!profile?.googleId && profile.status === 'APPROVE' && (profile.role === 'ADMIN' || profile?.role === 'ORGANIZATION'),
            label: 'Calendar',
            to: '/manage/create-calendar',
        },
        {
            condition:
                !!profile?.googleId && profile.status === 'APPROVE' && (profile.role === 'ADMIN' || profile?.role === 'ORGANIZATION'),
            label: 'Schedule',
            to: '/manage/weekly-schedule',
        },

        {
            condition:
                !!profile?.googleId && profile.status === 'APPROVE' && (profile.role === 'ADMIN' || profile?.role === 'ORGANIZATION'),
            label: 'Member',
            to: '/manage/member',
        },
        {
            condition:
                !!profile?.googleId && profile.status === 'APPROVE' && (profile.role === 'ADMIN' || profile?.role === 'ORGANIZATION'),
            label: 'ตั้งค่าระบบ',
            to: '/manage/system-config',
        },
    ];

    //
    return (
        <Box sx={{ width: '100%', minHeight: 'inherit' }} display={'flex'} flexDirection={'column'}>
            <AppBar position='relative' sx={{ height: '75px' }}>
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Box>
                        <Grid container spacing={3}>
                            <Grid size='auto'>
                                <Box borderRadius={1} overflow={'hidden'}>
                                    <CardMedia
                                        component='img'
                                        sx={{ width: 50 }}
                                        image={`${process.env.PUBLIC_URL}/images/logo/projectsoft-logo.png`}
                                        alt='logo'
                                    />
                                </Box>
                            </Grid>
                            {/* nav menu desktop */}
                            <Grid
                                size='grow'
                                // display={"none"}
                                alignItems={'center'}
                                sx={{ display: { xs: 'none', sm: 'none', md: 'flex' } }}
                            >
                                <Stack direction={'row'} alignItems={'center'} spacing={2}>
                                    {menuData.map(
                                        (m) =>
                                            m.condition && (
                                                <MenuItem key={m.label} to={m.to}>
                                                    {m.label}
                                                </MenuItem>
                                            )
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box display={'flex'} sx={{ gap: 1 }} alignItems={'center'}>
                        <SwitchThemeModeButton />
                        {/* nav profile desktop */}
                        <Box alignItems={'center'} sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, gap: 1 }}>
                            {authLoading ? (
                                'Loading...'
                            ) : (
                                <>
                                    {isSignedIn ? (
                                        <>
                                            <Avatar />
                                            <Typography>{profile?.fullName}</Typography>
                                            <Button variant='contained' color='error' onClick={signOutUser}>
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant='contained' color='secondary' onClick={signInWithGoogle}>
                                                Signin with google
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </Box>
                        <Box sx={{ display: { xs: 'blobk', sm: 'block', md: 'none' } }}>
                            <Button size='small' variant='contained' color='secondary' onClick={() => toggleDrawer(true)}>
                                <MenuIcon />
                            </Button>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                slotProps={{
                    paper: {
                        sx: {
                            width: '100%',
                            maxWidth: '400px',
                            boxSizing: 'border-box',
                        },
                    },
                }}
                open={open}
                onClose={() => toggleDrawer(false)}
            >
                <Box display={'flex'} justifyContent={'flex-end'}>
                    <IconButton onClick={() => toggleDrawer(false)}>
                        <CloseIcon color='error' />
                    </IconButton>
                </Box>
                <Toolbar sx={{ display: 'block', paddingTop: 2 }}>
                    <Box alignItems={'center'} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {authLoading ? (
                            'Loading...'
                        ) : (
                            <>
                                {isSignedIn ? (
                                    <>
                                        <Avatar />
                                        <Typography>{profile?.fullName}</Typography>
                                        <Button variant='contained' color='error' onClick={signOutUser}>
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant='contained' color='secondary' onClick={signInWithGoogle}>
                                            Signin with google
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                    <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                    <Stack direction={'column'} alignItems={'start'} spacing={2}>
                        {menuData.map(
                            (m) =>
                                m.condition && (
                                    <MenuItem to={m.to} key={m.label} onClick={() => setOpen(false)}>
                                        {m.label}
                                    </MenuItem>
                                )
                        )}
                    </Stack>
                </Toolbar>
            </Drawer>
            <Box
                component={'main'}
                sx={(theme) => ({
                    flex: 'auto',
                    padding: '24px',
                    backgroundColor: theme.palette.background.default,
                })}
            >
                {!authLoading && profile && <Outlet />}
                {!authLoading && !profile && (
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

export default Layout;
