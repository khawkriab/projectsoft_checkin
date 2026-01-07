import { Box, Modal, Typography } from '@mui/material';
import { GoogleMap } from '@react-google-maps/api';
import { AdvancedMarker } from 'components/common/GoogleMaps';
import { FlipIcon } from './FlipIcon';
import { useEffect, useRef, useState } from 'react';
import { getSystemAreaConfig } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import isWithinRadius from 'helper/checkDistance';
import { OnCheckinType } from './TodayCheckIn';
import { LatLng, SystemAreaConfig } from 'type.global';
import { isMobileDevice } from './CheckinButton';

export function ModalMapsCheckin({
    isMapsLoaded,
    checkinAreaSuccess,
    open,
    onCheckin,
    onClose,
}: {
    open: boolean;
    isMapsLoaded: boolean;
    checkinAreaSuccess: boolean;
    onCheckin: OnCheckinType;
    onClose: () => void;
}) {
    const watchId = useRef<number>(0);
    const isMobile = isMobileDevice();
    //
    const [areaConfig, setAreaConfig] = useState<SystemAreaConfig | null>(null);
    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    //
    useEffect(() => {
        // make sure clear watchPosition
        navigator.geolocation.clearWatch(watchId.current);

        if (open) {
            if (!areaConfig || !isMobile) {
                onClose();

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

                        onCheckin(false, '', current);
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

        return () => {
            navigator.geolocation.clearWatch(watchId.current);
        };
    }, [open, isMobile, JSON.stringify(areaConfig)]);

    useEffect(() => {
        const getAreaConfig = async () => {
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
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                    {isMapsLoaded && open && areaConfig && (
                        <GoogleMap
                            options={{
                                mapId: process.env.REACT_APP_GOOGLE_MAPS_STYLE_ID,
                                disableDefaultUI: true,
                                mapTypeId: 'hybrid',
                            }}
                            mapContainerStyle={{
                                width: '100%',
                                height: '400px',
                            }}
                            zoom={17}
                            center={currentLocation || { lat: areaConfig.lat, lng: areaConfig.lng }}
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
                            {currentLocation && (
                                <AdvancedMarker
                                    position={currentLocation}
                                    label='You'
                                    imgUrl='/projectsoft_checkin/images/personPinCircleIcon.svg'
                                    color='#00ff48'
                                />
                            )}
                        </GoogleMap>
                    )}
                    {checkinAreaSuccess && <FlipIcon />}
                </Box>
                <Typography
                    sx={(theme) => ({
                        mt: 1,
                        textAlign: 'center',
                        color: theme.palette.primary.contrastText,
                    })}
                    variant='h5'
                >
                    กำลังค้นหาตำแหน่ง....
                </Typography>
                <Typography
                    sx={(theme) => ({
                        mt: 1,
                        textAlign: 'center',
                        color: theme.palette.primary.contrastText,
                    })}
                >
                    {currentLocation && `${currentLocation?.lat},${currentLocation?.lng}`}
                </Typography>
            </Box>
        </Modal>
    );
}
