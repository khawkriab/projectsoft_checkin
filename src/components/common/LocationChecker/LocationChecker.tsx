import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import isWithinRadius from 'helper/checkDistance';
import { useEffect, useState } from 'react';
import { LatLng } from 'type.global';

const libraries = ['places'];
const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

function LocationChecker() {
    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [isWithin, setIsWithin] = useState(false);
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: 'AIzaSyBdt1dApGQpWou2IWmRkSF6W5Dqei8k8bc',
        libraries: libraries as any,
    });

    // Target point
    // 16.455647329319532, 102.81962779039188
    const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const current = { lat: latitude, lng: longitude };
                setCurrentLocation(current);
                const within = isWithinRadius(current, target, 50); // 50 meters
                setIsWithin(within);
            },
            (error) => {
                console.error('Error getting location:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div>
            <h3>Real-Time Location Checker</h3>
            {currentLocation && (
                <>
                    <p>
                        Your Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                        <br />
                        Within 100m of target: <strong>{isWithin ? 'Yes' : 'No'}</strong>
                    </p>
                    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={17} center={target}>
                        <Marker position={target} label='Target' />
                        {currentLocation && <Marker position={currentLocation} label='You' />}
                    </GoogleMap>
                </>
            )}
        </div>
    );
}

export default LocationChecker;
