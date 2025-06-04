import { Box, BoxProps, Button } from '@mui/material';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import isWithinRadius from 'helper/checkDistance';
import { useEffect, useRef, useState } from 'react';
import { LatLng } from 'type.global';

type LocationCheckerProps = BoxProps & {
    showMaps?: boolean;
    checkAvail?: boolean;
    onMatchTarget: (isWithin: boolean) => void;
    onErrorLocation: (message: string) => void;
};

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
    const [startCheckLocation, setStartCheckLocation] = useState(checkAvail);
    const [isWithin, setIsWithin] = useState(false);
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyBdt1dApGQpWou2IWmRkSF6W5Dqei8k8bc',
        libraries: libraries as any,
    });

    // Target point
    // 16.455647329319532, 102.81962779039188
    const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };

    useEffect(() => {
        if (checkAvail || showMaps) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    console.log('watchPosition');
                    const { latitude, longitude } = position.coords;
                    const current = { lat: latitude, lng: longitude };
                    setCurrentLocation(current);
                    const within = isWithinRadius(current, target, 50); // 50 meters
                    // setIsWithin(within);
                    onMatchTarget(within);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    onMatchTarget(false);
                    onErrorLocation(logError(error));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 1000,
                    maximumAge: 0,
                }
            );
        }

        return () => navigator.geolocation.clearWatch(watchId.current);
    }, [checkAvail, showMaps]);

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
