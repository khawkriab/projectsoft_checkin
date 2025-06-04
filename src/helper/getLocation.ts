const options = {
    enableHighAccuracy: true,
    timeout: 50000,
    maximumAge: 0,
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

const getLocation = (continueAfterTimeout?: boolean) => {
    return new Promise<{ isAllowLocation: boolean; lat: number; lng: number }>((resolve) => {
        let hasAllowAfterTimeout = false;
        let result = { isAllowLocation: false, lat: 0, lng: 0 };

        const timer = setTimeout(() => {
            console.warn('Time out to allow location.');
            hasAllowAfterTimeout = true;
            resolve(result);
        }, 15000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (res) => {
                    result.isAllowLocation = true;
                    result.lat = res.coords.latitude;
                    result.lng = res.coords.longitude;

                    if (hasAllowAfterTimeout && continueAfterTimeout) window.location.reload();

                    clearTimeout(timer);
                    resolve(result);
                },
                (error) => {
                    console.log('error:', error);
                    console.warn(logError(error));
                    clearTimeout(timer);
                    resolve(result);
                },
                options
            );
        } else {
            console.warn('Geolocation is not supported by this browser.');
            clearTimeout(timer);
            resolve(result);
        }
    });
};

export default getLocation;
