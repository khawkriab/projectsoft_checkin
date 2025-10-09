import { useGoogleMap } from '@react-google-maps/api';
import { useEffect, useRef } from 'react';

export function AdvancedMarker({
    position,
    label,
    color,
    imgUrl,
}: {
    position: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined;
    label?: string;
    color?: string;
    imgUrl: string;
}) {
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
    const maps = useGoogleMap();

    useEffect(() => {
        if (!window.google || !window.google.maps || !maps) return;

        // Create the AdvancedMarkerElement
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Marker';
        img.style.width = '30px';
        img.style.height = '30px';
        img.style.filter = `drop-shadow(0 2px 4px ${color || '#0080ff'})`;
        // img.style.fill = 'drop-shadow(0 2px 4px rgb(0, 128, 255))';
        // img.style.color = 'drop-shadow(0 2px 4px rgb(0, 128, 255))';

        markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map: maps, // or pass map reference if available
            position,
            content: img,
            title: label,
        });
    }, []);

    return null;
}
