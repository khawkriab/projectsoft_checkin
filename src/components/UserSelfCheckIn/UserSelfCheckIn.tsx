import { Box, Button, Grid, TextField } from '@mui/material';
import { getUserWorkTime, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { usersUpdateAllowLocation } from 'context/FirebaseProvider/firebaseApi/userApi';
import { LocationChecker } from 'components/common/LocationChecker';
import { useNotification } from 'components/common/NotificationCenter';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { deviceDetect, isAndroid, isIOS, isMobile } from 'react-device-detect';
import { CheckinDate, LatLng } from 'type.global';
import { useFirebase } from 'context/FirebaseProvider';

function UserSelfCheckIn({ defaultWfh }: { defaultWfh: boolean }) {
    const { profile, updateUserInfo } = useFirebase();
    const { openNotify } = useNotification();
    const latlng = useRef<LatLng>({ lat: 0, lng: 0 });
    //
    const [updating, setUpdating] = useState(false);
    const [findingLocation, setFindingLocation] = useState(false);
    const [isAvail, setIsAvail] = useState(false);
    const [allowFindLocation, setAllowFindLocation] = useState(false);
    const [reason, setReason] = useState('');
    const [userCheckinToday, setUserCheckinToday] = useState<CheckinDate | null | undefined>(undefined);
    //
    const parseData = dayjs().format('YYYY-MM-DD');
    //
    const allowThisSize = useMemo(() => {
        // return true;
        return ((isIOS || isAndroid) && isMobile) || process.env.REACT_APP_TEST === '1';
    }, [isIOS, isAndroid, isMobile]);

    const onCheckin = async (isWorkOutside = false, remark?: string) => {
        if (profile) {
            setUpdating(true);

            const res = await getUserWorkTime({ startDate: parseData, email: profile.email });

            const payload: CheckinDate = {
                date: parseData,
                email: profile.email,
                googleId: profile.googleId,
                name: profile.name,
                time: dayjs().format('HH:mm'),
                remark: remark ?? res?.remark ?? '',
                reason: reason ?? res?.reason ?? '',
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                leavePeriod: res?.leavePeriod || null,
                absentId: res?.absentId || null,
                isWorkOutside: isWorkOutside,
                status: 99,
                device: deviceDetect(undefined),
                latlng: latlng.current,
            };

            try {
                await updateWorkTime(payload, res?.id);
                getUserCheckinToday();

                openNotify('success', 'updated successfully');
            } catch (error) {
                console.error('error:', error);
            }
        }

        setFindingLocation(false);
        setUpdating(false);
    };

    const onCheckinWFH = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin(true, 'WFH');
    };

    const onAllowFindLocation = async (isAllow: boolean) => {
        if (profile) {
            setUpdating(true);
            await usersUpdateAllowLocation(profile?.id ?? '', isAllow ? 1 : 0);
            await updateUserInfo(profile);

            openNotify('success', 'success');
            setUpdating(false);
        } else {
            openNotify('error', 'profile not ready');
        }
    };
    const onCheckinOnArea = async () => {
        onCheckin();
    };

    const getUserCheckinToday = async () => {
        try {
            const res = await getUserWorkTime({ startDate: parseData, email: profile?.email || '' });

            if (res) {
                setUserCheckinToday({ ...res });
            } else {
                setUserCheckinToday(null);
            }
        } catch (error) {
            console.error('error:', error);
            setUserCheckinToday(null);
        }
    };

    useEffect(() => {
        if (allowThisSize && userCheckinToday === null) {
            setAllowFindLocation(!!profile?.allowFindLocation);
            setFindingLocation(!!profile?.allowFindLocation);
        }
    }, [profile?.allowFindLocation, allowThisSize, userCheckinToday]);

    useEffect(() => {
        getUserCheckinToday();
    }, []);

    //
    return (
        <>
            {userCheckinToday && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}>
                    <Box>เวลาเข้างาน: {dayjs(`${userCheckinToday.date} ${userCheckinToday.time}`).format('DD-MM-YYYY HH:mm')}</Box>
                    <Box
                        sx={(theme) => ({
                            padding: '2px 4px',
                            borderRadius: 1,
                            color: theme.palette.success.contrastText,
                            backgroundColor: Number(userCheckinToday.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                        })}
                    >
                        สถานะ: {Number(userCheckinToday.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}
                    </Box>
                </Box>
            )}

            {userCheckinToday === null && (
                <LocationChecker
                    checkAvail={findingLocation}
                    sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}
                    onErrorLocation={(m) => {
                        openNotify('error', m);
                        setFindingLocation(false);
                        latlng.current = { lat: 0, lng: 0 };
                    }}
                    onMatchTarget={(e, l) => {
                        setIsAvail(e);
                        // setFindingLocation(!e);
                        latlng.current = l;
                    }}
                >
                    {profile?.status === 'APPROVE' && (
                        <Grid container gap={2} alignItems={'center'} width={'100%'}>
                            <Grid size={!defaultWfh ? { xs: 12, sm: 12, md: 7 } : 'auto'}>
                                <Box component={'form'} onSubmit={onCheckinWFH}>
                                    <Grid container alignItems={'center'} gap={2} sx={{ width: '100%' }}>
                                        {!defaultWfh && (
                                            <Grid size={{ xs: 12, sm: 'grow' }}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label='เหตุผลที่ work from home'
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                />
                                            </Grid>
                                        )}
                                        <Grid flex={'none'}>
                                            <Button
                                                type='submit'
                                                size='large'
                                                // disabled={!!currentUserData}
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
                            {allowThisSize && (
                                <Grid flex={'auto'} display={'flex'} gap={2}>
                                    {allowFindLocation && (
                                        <Button
                                            disabled={!isAvail}
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

export default UserSelfCheckIn;
