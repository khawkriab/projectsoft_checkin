import { Alert, AlertColor, Box, Button, Grid, Slide, Snackbar, TextField } from '@mui/material';
import { useFirebase } from 'components/common/FirebaseProvider';
import { addUserCheckinToday, deleteOldCheckin, getCheckinToday } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { usersUpdateAllowLocation } from 'components/common/FirebaseProvider/firebaseApi/userApi';
import { LocationChecker } from 'components/common/LocationChecker';
import dayjs from 'dayjs';
import { CheckinDataList } from 'pages/Home/HomeFirebase';
import { useEffect, useRef, useState } from 'react';
import { deviceDetect, isAndroid, isIOS, isMobile } from 'react-device-detect';
import { LatLng, UserCheckInData } from 'type.global';

function UserCheckIn({ checkinToday }: { checkinToday?: CheckinDataList }) {
    const { profile, updateUserInfo } = useFirebase();
    const latlng = useRef<LatLng>({ lat: 0, lng: 0 });
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
        if (profile) {
            const now = dayjs().utc().valueOf();

            setUpdating(true);

            const payload: UserCheckInData = {
                googleId: profile?.googleId,
                email: profile.email,
                name: profile.name,
                time: String(now),
                remark: remark ?? '',
                reason: reason,
                device: deviceDetect(undefined),
                latlng: latlng.current,
                status: 99,
            };
            await addUserCheckinToday(payload);
            await getUserCheckinToday();

            setAlertOptions((prev) => ({
                ...prev,
                message: 'updated successfully',
                color: 'success',
                open: true,
            }));
        }

        setFindingLocation(false);
        setUpdating(false);
    };

    const onCheckinWFH = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin('WFH');
    };

    const onAllowFindLocation = async (isAllow: boolean) => {
        if (profile) {
            setUpdating(true);
            await usersUpdateAllowLocation(profile?.id ?? '', isAllow ? 1 : 0);
            await updateUserInfo(profile);

            setAlertOptions((prev) => ({
                ...prev,
                message: 'success',
                color: 'success',
                open: true,
            }));
            setUpdating(false);
        } else {
            setAlertOptions((prev) => ({
                ...prev,
                message: 'profile not ready',
                color: 'error',
                open: true,
            }));
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
        if ((isIOS || isAndroid) && isMobile && currentUserData === null) {
            setAllowFindLocation(!!profile?.allowFindLocation);
            setFindingLocation(!!profile?.allowFindLocation);
        }
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
            {checkinToday && !checkinToday.userCheckinList.find((f) => f?.email === profile?.email) && profile?.status === 'APPROVE' && (
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
                        latlng.current = { lat: 0, lng: 0 };
                    }}
                    onMatchTarget={(e, l) => {
                        setIsAvail(e);
                        // setFindingLocation(!e);
                        latlng.current = l;
                    }}
                >
                    {currentUserData && (
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
                    {currentUserData === null && profile?.status === 'APPROVE' && (
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
                            {(isIOS || isAndroid) && isMobile && (
                                <Grid flex={'auto'} display={'flex'} gap={2}>
                                    {allowFindLocation && (
                                        <Button
                                            disabled={!!currentUserData || !isAvail}
                                            loading={updating}
                                            size='large'
                                            variant='contained'
                                            color='primary'
                                            onClick={() => onCheckinOnArea()}
                                        >
                                            {findingLocation && !isAvail ? 'กำลังหาตำแหน่ง...' : isAvail ? 'ลงชื่อเข้างาน' : 'ค้นหาตำแหน่ง'}
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
                            )}
                        </Grid>
                    )}
                </LocationChecker>
            )}
        </>
    );
}

export default UserCheckIn;
