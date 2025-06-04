import { Alert, AlertColor, Box, Button, Grid, Slide, Snackbar, TextField } from '@mui/material';
import {
    addUserCheckinToday,
    deleteOldCheckin,
    getCheckinToday,
    usersUpdateAllowLocation,
} from 'components/common/firebase/firebaseApi/checkinApi';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { LocationChecker } from 'components/common/LocationChecker';
import dayjs from 'dayjs';
import useLocation from 'hooks/useLocation';
import { CheckinDataList } from 'pages/Home/HomeFirebase';
import { useEffect, useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { UserCheckInData } from 'type.global';

function UserCheckIn({ checkinToday }: { checkinToday?: CheckinDataList }) {
    const { auth2, profile, updateProfile } = useGoogleLogin();
    const { lat, lng } = useLocation();
    //
    const [updating, setUpdating] = useState(false);
    const [findingLocation, setFindingLocation] = useState(false);
    const [isAvail, setIsAvail] = useState(false);
    const [allowFindLocation, setAllowFindLocation] = useState(false);
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

    const onAllowFindLocation = async (isAllow: boolean) => {
        if (profile && auth2) {
            setUpdating(true);
            await usersUpdateAllowLocation(profile?.token ?? '', profile?.id ?? '', isAllow ? 1 : 0);
            await updateProfile(auth2);

            setAlertOptions((prev) => ({
                ...prev,
                message: 'success',
                color: 'success',
                open: true,
            }));
            setUpdating(false);
        }
    };
    const onCheckinOnArea = async () => {
        onCheckin(reason);
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
        setAllowFindLocation(!!profile?.allowFindLocation);
        setFindingLocation(!!profile?.allowFindLocation);
    }, [profile?.allowFindLocation]);

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
            {checkinToday && !checkinToday.userCheckinList.find((f) => f?.email === profile?.email) && (
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
                        setFindingLocation(false);
                    }}
                    onMatchTarget={(e) => {
                        setIsAvail(e);
                        setFindingLocation(!e);
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
                            <Grid flex={'auto'} display={'flex'} gap={2}>
                                {allowFindLocation && (
                                    <Button
                                        disabled={!!currentUserData || findingLocation}
                                        loading={updating}
                                        size='large'
                                        variant='contained'
                                        color='primary'
                                        onClick={() => onCheckinOnArea()}
                                    >
                                        {findingLocation ? 'กำลังหาตำแหน่ง...' : isAvail ? 'ลงชื่อเข้างาน' : 'ค้นหาตำแหน่ง'}
                                    </Button>
                                )}
                                <Button
                                    loading={updating}
                                    size='large'
                                    variant='contained'
                                    color='error'
                                    onClick={() => onAllowFindLocation(!allowFindLocation)}
                                >
                                    {allowFindLocation ? 'หยุดค้นหาตำแหน่ง' : 'อนุญาติให้ค้นหาตำแหน่ง'}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                    {/* </Box> */}
                </LocationChecker>
            )}
        </>
    );
}

export default UserCheckIn;
