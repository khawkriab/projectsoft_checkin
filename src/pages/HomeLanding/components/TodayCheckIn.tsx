import { Box, Grid } from '@mui/material';
import { useLoadScript } from '@react-google-maps/api';
import DateTime from 'components/common/DateTime/DateTime';
import { useFirebase } from 'context/FirebaseProvider';
import { getUserWorkTime, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import { useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { CheckinDate, LatLng } from 'type.global';
import { useUserCalendarContext } from 'context/UserCalendarProvider';
import { CheckinButton } from './CheckinButton';
import { ModalMapsCheckin } from './ModalMapsCheckin';
import { ModalCheckinWorkOutside } from './ModalCheckinWorkOutside';

export type OnCheckinType = (isWorkOutside?: boolean, remark?: string, latlng?: LatLng, reason?: string) => Promise<void>;

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
    const { getUserCheckin } = useUserCalendarContext();
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
        mapIds: [process.env.REACT_APP_GOOGLE_MAPS_ID as string],
    });
    //
    const [checkAvail, setCheckAvail] = useState(false);
    const [checkinAreaSuccess, setCheckinAreaSuccess] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [openModalOutsideArea, setOpenModalOutsideArea] = useState(false);
    //

    const onCheckin: OnCheckinType = async (isWorkOutside = false, remark, latlng, reason) => {
        setIsSending(true);
        if (profile) {
            const res = await getUserWorkTime({ startDate: parseData, suid: profile.suid });

            const payload: CheckinDate = {
                date: parseData,
                email: profile.email,
                suid: profile.suid,
                name: profile.name,
                time: dayjs().format('HH:mm'),
                remark: remark ?? res?.remark ?? '',
                reason: (reason || res?.reason) ?? '',
                approveBy: profile?.name ?? '',
                approveBySuid: profile?.suid ?? '',
                leavePeriod: res?.leavePeriod || null,
                absentId: res?.absentId || null,
                isWorkOutside: isWorkOutside,
                status: 99,
                device: deviceDetect(undefined),
                latlng: latlng || null,
            };

            try {
                await updateWorkTime(payload, res?.id);
                await getUserCheckin();
            } catch (error) {
                console.error('error:', error);
            }
        }

        if (isWorkOutside) {
            setIsSending(false);
            setOpenModalOutsideArea(false);
        } else {
            setCheckinAreaSuccess(true);

            setTimeout(() => {
                setCheckAvail(false);
            }, 3000);
        }
    };

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
                                border: theme.palette.mode === 'light' ? 'none' : '2px solid #a0a0a03a',
                                background:
                                    theme.palette.mode === 'light'
                                        ? { xs: 'transparent', lg: 'linear-gradient(to right, #085aff,#47D7EB)' }
                                        : 'transparent',
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
                        <CheckinButton
                            isMapsLoaded={isLoaded}
                            isSending={isSending}
                            onCheckin={onCheckin}
                            onOpenModalMapsCheckin={() => setCheckAvail(true)}
                            onOpenModalOutsideArea={() => setOpenModalOutsideArea(true)}
                        />
                    </Grid>
                </Grid>
            </Box>
            {/* ------------------------------- popup ----------------------------- */}
            <ModalMapsCheckin
                isMapsLoaded={isLoaded}
                checkinAreaSuccess={checkinAreaSuccess}
                open={checkAvail}
                onCheckin={onCheckin}
                onClose={() => {
                    setCheckinAreaSuccess(false);
                    setCheckAvail(false);
                }}
            />
            <ModalCheckinWorkOutside
                isSending={isSending}
                open={openModalOutsideArea}
                onClose={() => setOpenModalOutsideArea(false)}
                onCheckin={onCheckin}
            />
        </>
    );
}
