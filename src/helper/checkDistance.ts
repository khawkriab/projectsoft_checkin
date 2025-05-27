export type LatLng = { lat: number; lng: number };

function isWithinRadius(current: LatLng, target: LatLng, radiusInMeters: number): boolean {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(target.lat - current.lat);
    const dLng = toRad(target.lng - current.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(current.lat)) * Math.cos(toRad(target.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance <= radiusInMeters;
}

export default isWithinRadius;
