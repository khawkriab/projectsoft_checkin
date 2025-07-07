import { Box, BoxProps } from '@mui/material';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import isWithinRadius from 'helper/checkDistance';
import { useEffect, useRef, useState } from 'react';
import { LatLng } from 'type.global';

type LocationCheckerProps = BoxProps & {
    showMaps?: boolean;
    checkAvail?: boolean;
    onMatchTarget: (
        isWithin: boolean,
        latlng: {
            lat: number;
            lng: number;
        }
    ) => void;
    onErrorLocation: (message: string) => void;
};
const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

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

function LocationChecker({
    checkAvail = false,
    showMaps,
    children,
    onErrorLocation = () => {},
    onMatchTarget = () => {},
    ...props
}: LocationCheckerProps) {
    const watchId = useRef<number>(0);
    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
    });

    // Target point
    // 16.455647329319532, 102.81962779039188

    useEffect(() => {
        if (checkAvail) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    console.log('watchPosition');
                    const { latitude, longitude } = position.coords;
                    const current = { lat: latitude, lng: longitude };
                    const within = isWithinRadius(current, target, 50); // 50 meters
                    setCurrentLocation(current);
                    // setIsWithin(within);
                    onMatchTarget(within, current);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    onErrorLocation(logError(error));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // max time to wait for *each* update
                    maximumAge: 0, // don’t reuse cached position
                }
            );
        }

        return () => navigator.geolocation.clearWatch(watchId.current);
    }, [checkAvail]);

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <>
            {currentLocation && checkAvail && (
                <>
                    {/* <p>
                        Your Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        <br />
                        Within 100m of target: <strong>{isWithin ? 'Yes' : 'No'}</strong>
                    </p> */}
                    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={17} center={currentLocation}>
                        <Marker position={target} label='Target' />
                        {currentLocation && <Marker position={currentLocation} label='You' />}
                    </GoogleMap>
                </>
            )}
            <Box {...props}>{children}</Box>
        </>
    );
}

export default LocationChecker;
