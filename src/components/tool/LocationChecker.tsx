import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";

type LatLng = { lat: number; lng: number };

type LocationCheckerProps = {
  onLocationUpdate?: (data: {
    isWithin: boolean;
    location: LatLng;
    allowLocation: boolean;
    errMassage: string;
  }) => void;
};

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };

function isWithinRadius(
  current: LatLng,
  target: LatLng,
  radiusInMeters: number
): boolean {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(target.lat - current.lat);
  const dLng = toRad(target.lng - current.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(current.lat)) *
      Math.cos(toRad(target.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusInMeters;
}

function LocationChecker({ onLocationUpdate }: LocationCheckerProps) {
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [isWithin, setIsWithin] = useState(false);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBdt1dApGQpWou2IWmRkSF6W5Dqei8k8bc",
    libraries: libraries as any,
  });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const current = { lat: latitude, lng: longitude };
        const within = isWithinRadius(current, target, 50);
        setCurrentLocation(current);
        setIsWithin(within);

        // ส่งข้อมูลกลับไปให้ parent
        onLocationUpdate?.({
          isWithin: within,
          location: current,
          allowLocation: true,
          errMassage: "",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        onLocationUpdate?.({
          isWithin: false,
          location: { lat: 0, lng: 0 },
          allowLocation: false,
          errMassage: error.message,
        });
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

  return <div></div>;
}

export default LocationChecker;
