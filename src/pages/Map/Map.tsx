import React, { useEffect, useState } from "react";
import { useFetcher } from "hooks/useFetcher";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/th";
import {
  GoogleMap,
  useJsApiLoader,
  InfoWindow,
  OverlayView,
} from "@react-google-maps/api";
import { Paper, Typography } from "@mui/material";

dayjs.locale("th");

type Users = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  image: string;
};

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

function Map() {
  const { POST } = useFetcher();
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<Users[]>([]);
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBdt1dApGQpWou2IWmRkSF6W5Dqei8k8bc",
  });

  useEffect(() => {
    if (isLoaded) {
      getUserLocation();
    }
  }, [isLoaded]);

  const getUserLocation = async () => {
    try {
      const result = await POST("/checkin/getmap", {});
      if (Array.isArray(result)) {
        const formattedUsers = result
          .filter(
            (user: any) =>
              user.latitude &&
              user.longitude &&
              !isNaN(parseFloat(user.latitude)) &&
              !isNaN(parseFloat(user.longitude))
          )
          .map((user: any) => ({
            id: user.user_id,
            name: user.user_nickname,
            lat: parseFloat(user.latitude),
            lng: parseFloat(user.longitude),
            image:
              user.user_image_url ||
              "https://www.svgrepo.com/show/382106/default-avatar.svg",
          }));

        // ถ้ามี userId ให้แสดงเฉพาะคนนั้น
        if (userIdParam) {
          const filtered = formattedUsers.filter((u) => u.id === userIdParam);
          setUsers(filtered);
        } else {
          setUsers(formattedUsers);
        }
      } else {
        console.error("รูปแบบข้อมูลผิด:", result);
      }
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={
        users.length > 0
          ? { lat: users[0].lat, lng: users[0].lng }
          : { lat: 16.439246, lng: 102.808833 }
      }
      zoom={14}
      options={{ gestureHandling: "greedy" }}
    >
      {users.map((user, index) => (
        <React.Fragment key={index}>
          <OverlayView
            position={{ lat: user.lat, lng: user.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                position: "relative",
                transform: "translate(-50%, -100%)",
                cursor: "pointer",
              }}
              onClick={() =>
                setVisibleIndex(index === visibleIndex ? null : index)
              }
            >
              <img
                src="https://pngimg.com/uploads/google_maps_pin/google_maps_pin_PNG25.png"
                style={{ width: 80, height: 80 }}
                alt="pin"
              />

              <img
                src={user.image}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  position: "absolute",
                  top: 4.5,
                  left: 15.2,
                  border: "2px solid white",
                }}
                alt={user.name}
              />
            </div>
          </OverlayView>

          {visibleIndex === index && (
            <InfoWindow
              position={{ lat: user.lat, lng: user.lng }}
              onCloseClick={() => setVisibleIndex(null)}
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
  ) : (
    <div>Loading map...</div>
  );
}

export default Map;
