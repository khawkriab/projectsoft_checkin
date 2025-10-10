import { Box, Button, Grid, Modal, Stack, TextField, Typography } from '@mui/material';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import DateTime from 'components/common/DateTime/DateTime';
import { AdvancedMarker } from 'components/common/GoogleMaps';
import { useFirebase } from 'context/FirebaseProvider';
import { getSystemAreaConfig, getUserWorkTime, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import isWithinRadius from 'helper/checkDistance';
import { useEffect, useRef, useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { CheckinDate, LatLng, SystemAreaConfig } from 'type.global';
import { FlipIcon } from './FlipIcon';

const libraries = ['places', 'marker'];

function logError(error: GeolocationPositionError) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'User denied the request for Geolocation.';
        case error.POSITION_UNAVAILABLE:
            return 'Location information is unavailable.';
        case error.TIMEOUT:
            return 'The request to get user location timed out.';
        default:
            return 'An unknown error';
    }
}

export function TodayCheckIn() {
    const parseData = dayjs().format('YYYY-MM-DD');

    //
    const { profile } = useFirebase();
    //
    const watchId = useRef<number>(0);
    const submitButtonRemark = useRef('');
    //
    const [checkAvail, setCheckAvail] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [userCheckinToday, setUserCheckinToday] = useState<CheckinDate | null | undefined>(undefined);
    const [areaConfig, setAreaConfig] = useState<SystemAreaConfig | null>(null);
    const [openModalOutsideArea, setOpenModalOutsideArea] = useState(false);
    const [reason, setReason] = useState('');
    const [isSending, setIsSending] = useState(false);
    //

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
    });

    //
    const onCheckin = async (isWorkOutside = false, remark?: string, latlng?: LatLng) => {
        if (profile) {
            const res = await getUserWorkTime({ startDate: parseData, email: profile.email });

            const payload: CheckinDate = {
                date: parseData,
                email: profile.email,
                googleId: profile.googleId,
                name: profile.name,
                time: dayjs().format('HH:mm'),
                remark: remark ?? res?.remark ?? '',
                reason: (reason || res?.reason) ?? '',
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                leavePeriod: res?.leavePeriod || null,
                absentId: res?.absentId || null,
                isWorkOutside: isWorkOutside,
                status: 99,
                device: deviceDetect(undefined),
                latlng: latlng || null,
            };

            try {
                await updateWorkTime(payload, res?.id);
                getUserCheckinToday();

                // openNotify('success', 'updated successfully');
            } catch (error) {
                console.error('error:', error);
            }
        }

        if (isWorkOutside) {
            setIsSending(false);
            setOpenModalOutsideArea(false);
        } else {
            setIsLoading(false);

            setTimeout(() => {
                setCheckAvail(false);
            }, 3000);
        }
    };

    const onSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        onCheckin(true, submitButtonRemark.current);
    };

    const getUserCheckinToday = async () => {
        if (!profile?.email) return;
        console.log('getUserCheckinToday');

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

    const handleOpen = () => {
        setCheckAvail(true);
    };
    const handleClose = () => {
        setCheckAvail(false);
        navigator.geolocation.clearWatch(watchId.current);
    };

    useEffect(() => {
        if (checkAvail) {
            if (!areaConfig) {
                setCheckAvail(false);

                console.error('Not area config.');

                return;
            }

            console.log('start watch position');
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    console.log('watchPosition');
                    const { latitude, longitude } = position.coords;
                    const current = { lat: latitude, lng: longitude };
                    const within = isWithinRadius(current, { lat: areaConfig.lat, lng: areaConfig.lng }, areaConfig.radius); // in meters
                    setCurrentLocation(current);
                    // setIsWithin(within);
                    // onMatchTarget(within, current);
                    console.log('within:', within);
                    if (within) {
                        navigator.geolocation.clearWatch(watchId.current);
                        onCheckin();
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // onErrorLocation(logError(error));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // max time to wait for *each* update
                    maximumAge: 0, // don’t reuse cached position
                }
            );
        }

        return () => navigator.geolocation.clearWatch(watchId.current);
    }, [checkAvail, JSON.stringify(areaConfig)]);

    useEffect(() => {
        getUserCheckinToday();
    }, [JSON.stringify(profile)]);

    useEffect(() => {
        const getAreaConfig = async () => {
            console.log('getAreaConfig');
            try {
                const res = await getSystemAreaConfig();

                setAreaConfig({ ...res });
            } catch (error) {
                console.error('error:', error);
            }
        };

        getAreaConfig();
    }, []);

    return (
        <>
            <Box display={'flex'} flexDirection={{ xs: 'column', lg: 'column' }}>
                <Grid container spacing={1} mb={'12px'} height={{ xs: 'auto', lg: '100px' }}>
                    <Grid size={{ xs: 'grow', lg: 9 }}>
                        <Box
                            sx={(theme) => ({
                                borderRadius: '6px',
                                padding: '12px',
                                height: '100%',
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', lg: 'center' },
                                gap: '2px 12px',
                                fontSize: theme.typography.h5.fontSize,
                                color: { xs: theme.palette.text.primary, lg: theme.palette.primary.contrastText },
                                fontWeight: 500,
                                alignItems: { xs: 'flex-start', lg: 'center' },
                                flexDirection: { xs: 'column', md: 'row' },
                                background: { xs: 'transparent', lg: 'linear-gradient(to right, #085aff,#47D7EB)' },
                            })}
                        >
                            <Box>
                                <span>วันนี้ </span>
                                <DateTime show='date' />
                            </Box>
                            <Box>
                                <span>เวลา </span>
                                <DateTime show='time' />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 'auto', lg: 3 }} display={'flex'} flexDirection={'column'} gap={'6px'}>
                        {userCheckinToday === null && (
                            <>
                                <Button variant='contained' color='warning' sx={{ height: 'calc(50% - 4px)' }} onClick={handleOpen}>
                                    check-in
                                </Button>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    sx={{ height: 'calc(50% - 4px)' }}
                                    onClick={() => setOpenModalOutsideArea(true)}
                                >
                                    ทำงานนอกสถานที่
                                </Button>
                            </>
                        )}
                        {userCheckinToday && (
                            <>
                                {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}> */}

                                <Box
                                    sx={(theme) => ({
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        width: '100%',
                                        height: '100%',
                                        padding: '2px',
                                        borderRadius: 1,
                                        color: theme.palette.success.contrastText,
                                        backgroundColor: Number(userCheckinToday.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                                    })}
                                >
                                    <Typography>สถานะ: {Number(userCheckinToday.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}</Typography>
                                    <Typography>เวลาเข้างาน:</Typography>
                                    <Typography>
                                        {dayjs(`${userCheckinToday.date} ${userCheckinToday.time}`).format('DD-MM-YYYY HH:mm')}
                                    </Typography>
                                </Box>
                                {/* </Box> */}
                            </>
                        )}
                    </Grid>
                </Grid>
            </Box>
            {/* ------------------------------- popup ----------------------------- */}
            <Modal open={checkAvail} onClose={handleClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                    <Box
                        sx={{
                            bgcolor: '#fff',
                            borderRadius: '100%',
                            width: '300px',
                            height: '300px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '4px solid #878787',
                        }}
                    >
                        {isLoaded && checkAvail && areaConfig && (
                            <GoogleMap
                                options={{
                                    mapId: 'ab108a809fd161a2fadf6a75',
                                    disableDefaultUI: true,
                                }}
                                mapContainerStyle={{
                                    width: '100%',
                                    height: '400px',
                                }}
                                zoom={17}
                                center={{ lat: areaConfig.lat, lng: areaConfig.lng }}
                                onLoad={(map) => {
                                    new google.maps.Circle({
                                        map,
                                        center: { lat: areaConfig.lat, lng: areaConfig.lng },
                                        radius: areaConfig.radius, // in meters
                                        fillColor: '#FF0000',
                                        fillOpacity: 0.2,
                                        strokeColor: '#FF0000',
                                        strokeOpacity: 0.7,
                                        strokeWeight: 2,
                                    });
                                }}
                            >
                                {/* <AdvancedMarker position={target} label='Target' imgUrl='images/apartmentIcon.svg' /> */}
                                {currentLocation && (
                                    <AdvancedMarker
                                        position={currentLocation}
                                        label='You'
                                        imgUrl='images/personPinCircleIcon.svg'
                                        color='#00ff48'
                                    />
                                )}
                            </GoogleMap>
                        )}
                        {!isLoading && <FlipIcon />}
                    </Box>
                    <Typography
                        sx={(theme) => ({
                            mt: 1,
                            textAlign: 'center',
                            // color: theme.palette.secondary.contrastText,
                            // fontSize: theme.typography.h5,
                        })}
                        variant='h5'
                    >
                        กำลังค้นหาตำแหน่ง....
                    </Typography>
                </Box>
            </Modal>
            <Modal
                open={openModalOutsideArea}
                onClose={() => {
                    submitButtonRemark.current = '';
                    setOpenModalOutsideArea(false);
                }}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Box
                    sx={{
                        bgcolor: '#fff',
                        borderRadius: '12px',
                        p: '24px 12px 12px',
                        // width: '300px',
                        // height: '300px',
                        // overflow: 'hidden',
                        // display: 'flex',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                        border: '4px solid #878787',
                        width: '100%',
                        maxWidth: { xs: '90vw', lg: '700px' },
                    }}
                >
                    <Box component={'form'} onSubmit={onSubmit}>
                        <TextField
                            fullWidth
                            required
                            label='ระบุเหตุผล หรือ พื้นที่ที่ลงไปทำงาน'
                            placeholder='ระบุเหตุผล หรือ พื้นที่ที่ลงไปทำงาน'
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <Box display={'flex'} ml={'auto'} mt={2} justifyContent={'flex-end'} gap={1}>
                            <Button
                                type='submit'
                                variant='contained'
                                color='secondary'
                                sx={{ width: '100%', height: { xs: 'auto' } }}
                                onClick={() => (submitButtonRemark.current = 'WFH')}
                                loading={isSending}
                            >
                                ลงชื่อ WFH
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                color='error'
                                sx={{ width: '100%', height: { xs: 'auto' } }}
                                onClick={() => (submitButtonRemark.current = 'ทำงานนอกสถานที่')}
                                loading={isSending}
                            >
                                ลงชื่อทำงานนอกสถานที่
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}
