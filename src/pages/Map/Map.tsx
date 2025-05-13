import React, { useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Paper, Typography } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const users = [
  {
    name: "OTTER",
    lat: 16.439246,
    lng: 102.808833,
    image:
      "https://wwfint.awsassets.panda.org/img/original/__iucn_osg_jpeg_1.jpg",
  },
  {
    name: "OWL",
    lat: 16.458621,
    lng: 102.818272,
    image: "https://baimai.org/wp-content/uploads/2024/06/3-1.jpg",
  },
  {
    name: "CAT",
    lat: 16.448272,
    lng: 102.82927,
    image:
      "https://i.pinimg.com/236x/5c/bb/04/5cbb0499aa8a3149e20dc0c5b869a548.jpg",
  },
];

function Map() {
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  // ใช้ useJsApiLoader เพื่อโหลด Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBdt1dApGQpWou2IWmRkSF6W5Dqei8k8bc",
  });

  if (!isLoaded) {
    return <div>Loading...</div>; // รอให้โหลด API เสร็จก่อน
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: users[0].lat, lng: users[0].lng }}
      zoom={10}
    >
      {users.map((user, index) => (
        <React.Fragment key={index}>
          <Marker
            position={{ lat: user.lat, lng: user.lng }}
            onClick={() => setVisibleIndex(index)}
            icon={{
              url: user.image,
              scaledSize: new window.google.maps.Size(60, 60),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(30, 0),
            }}
          />
          {visibleIndex === index && (
            <InfoWindow
              position={{ lat: user.lat, lng: user.lng }}
              options={{ disableAutoPan: true }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 1,
                  bgcolor: "#f5f5f5",
                  minWidth: 100,
                  position: "relative",
                }}
              >
                <Typography
                  variant="subtitle2"
                  align="center"
                  color="primary"
                  fontWeight="bold"
                  mt={2}
                >
                  {user.name}
                </Typography>
              </Paper>
            </InfoWindow>
          )}
        </React.Fragment>
      ))}
    </GoogleMap>
  );
}

export default Map;
