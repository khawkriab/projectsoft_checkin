import { Alert, AlertColor, Box, Button, Grid, Slide, Snackbar, TextField } from '@mui/material';
import { addUserCheckinToday, deleteOldCheckin, getCheckinToday } from 'components/common/firebase/firebaseApi/checkinApi';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { LocationChecker } from 'components/common/LocationChecker';
import dayjs from 'dayjs';
import isWithinRadius from 'helper/checkDistance';
import getLocation from 'helper/getLocation';
import useLocation from 'hooks/useLocation';
import { useEffect, useRef, useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { LatLng, UserCheckInData } from 'type.global';

const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };

function UserCheckIn() {
    const { profile } = useGoogleLogin();
    const { lat, lng } = useLocation();
    //
    const timer = useRef<NodeJS.Timeout>(undefined);
    //
    const [updating, setUpdating] = useState(false);
    const [findingLocation, setFindingLocation] = useState(false);
    const [reason, setReason] = useState('');
    const [alertOptions, setAlertOptions] = useState({
        message: '',
        color: '',
        open: false,
    });
    const [currentUserData, setCurrentUserData] = useState<UserCheckInData | null | undefined>(undefined);
    //
    const onCheckin = async (remark?: string) => {
        if (profile?.token) {
            const now = dayjs().utc().valueOf();

            setUpdating(true);

            const payload: UserCheckInData = {
                googleId: profile?.googleId,
                email: profile.email,
                name: profile?.name,
                time: String(now),
                remark: remark ?? '',
                reason: reason,
                device: deviceDetect(undefined),
                latlng: { lat, lng },
                status: 99,
            };
            await addUserCheckinToday(profile.token, payload);
            await getUserCheckinToday();

            setAlertOptions((prev) => ({
                ...prev,
                message: 'updated successfully',
                color: 'success',
                open: true,
            }));
        }
        setUpdating(false);
    };

    const onCheckinWFH = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin('WFH');
    };

    const onCheckinOnArea = async () => {
        setFindingLocation(true);
        // clearInterval(timer.current);
        // const currentLocation = await getLocation();
        // const within = isWithinRadius(currentLocation, target, 50);
        // if (!currentLocation.isAllowLocation) {
        //     setUpdating(false);
        //     return setAlertOptions((prev) => ({
        //         ...prev,
        //         message: 'not allow location',
        //         color: 'error',
        //         open: true,
        //     }));
        // }
        // if (!within) {
        //     // setFindingLocation(true);
        //     return setAlertOptions((prev) => ({
        //         ...prev,
        //         message: 'not in area',
        //         color: 'error',
        //         open: true,
        //     }));
        // }
        // onCheckin();
    };

    const getUserCheckinToday = async () => {
        try {
            const res = await getCheckinToday(profile?.googleId ?? '');

            if (dayjs(Number(res.time)).isSame(dayjs(), 'day')) {
                setCurrentUserData({ ...res });
            } else {
                await deleteOldCheckin(res.id);
                setCurrentUserData(null);
            }
        } catch (error) {
            setCurrentUserData(null);
        }
    };

    useEffect(() => {
        getUserCheckinToday();
    }, []);
    //
    return (
        <>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={alertOptions.open}
                autoHideDuration={6000}
                onClose={() =>
                    setAlertOptions((prev) => ({
                        ...prev,
                        message: '',
                        color: '',
                        open: false,
                    }))
                }
            >
                <Alert
                    onClose={() =>
                        setAlertOptions((prev) => ({
                            ...prev,
                            message: '',
                            color: '',
                            open: false,
                        }))
                    }
                    severity={alertOptions.color as AlertColor}
                    variant='filled'
                    sx={{ width: '100%' }}
                >
                    {alertOptions.message}
                </Alert>
            </Snackbar>

            <LocationChecker
                checkAvail={findingLocation}
                sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}
                onErrorLocation={(m) => {
                    setAlertOptions((prev) => ({
                        ...prev,
                        message: m,
                        color: 'error',
                        open: true,
                    }));
                }}
                onMatchTarget={() => {
                    // setAlertOptions((prev) => ({
                    //     ...prev,
                    //     message: 'in area',
                    //     color: 'success',
                    //     open: true,
                    // }));
                    // setFindingLocation(false);
                }}
            >
                {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}> */}
                {currentUserData && profile?.role === 'USER' && (
                    <>
                        <Box>เวลาเข้างาน: {dayjs(Number(currentUserData.time)).format('DD-MM-YYYY HH:mm')}</Box>
                        <Box
                            sx={(theme) => ({
                                padding: '2px 4px',
                                borderRadius: 1,
                                color: theme.palette.success.contrastText,
                                backgroundColor: Number(currentUserData.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                            })}
                        >
                            สถานะ: {Number(currentUserData.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}
                        </Box>
                    </>
                )}
                {currentUserData === null && (
                    <Grid container gap={2} alignItems={'center'} width={'100%'}>
                        <Grid size={{ xs: 12, sm: 12, md: 7 }}>
                            <Box component={'form'} onSubmit={onCheckinWFH}>
                                <Grid container alignItems={'center'} gap={2} sx={{ width: '100%' }}>
                                    <Grid size={{ xs: 12, sm: 'grow' }}>
                                        <TextField
                                            fullWidth
                                            required
                                            label='เหตุผลที่ work from home'
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid flex={'none'}>
                                        <Button
                                            type='submit'
                                            size='large'
                                            disabled={!!currentUserData}
                                            loading={updating}
                                            variant='outlined'
                                            color='secondary'
                                        >
                                            ลงชื่อเข้างาน WFH
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid flex={'auto'}>
                            <Button
                                disabled={!!currentUserData || findingLocation}
                                loading={updating}
                                size='large'
                                variant='contained'
                                color='error'
                                onClick={() => onCheckinOnArea()}
                            >
                                {findingLocation ? 'กำลังหาตำแหน่ง...' : 'ลงชื่อเข้างาน'}
                            </Button>
                        </Grid>
                        <Grid flex={'auto'}>
                            <Button variant='contained' color='warning' size='large'>
                                show map
                            </Button>
                        </Grid>
                    </Grid>
                )}
                {/* </Box> */}
            </LocationChecker>
        </>
    );
}

export default UserCheckIn;
