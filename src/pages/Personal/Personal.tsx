import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { useFetcher } from "hooks/useFetcher";
import logo from "../../components/layout/dino_logo.png";
type UserCheckIn = {
  userId: string;
  userNickname: string;
  userImg: string;
  userPhone: string;
  userFullname: string;
  userJobPosition: string;
  userJobStatus: string;
  userEmail: string;
};

function Personal() {
  const { GET } = useFetcher();
  const [dataUser, setDataUser] = useState<UserCheckIn[]>([]);

  const fetchUsers = async () => {
    try {
      const result = await GET("/user");
      console.log("result:", result);

      const users: UserCheckIn[] = (result.data || []).map((u: any) => ({
        userId: u.user_id,
        userNickname: u.user_nickname,
        userImg: u.user_image_url,
        userPhone: u.user_phonenumber,
        userFullname: u.user_fullname,
        userJobPosition: u.user_job_position,
        userJobStatus: u.user_job_status,
        userEmail: u.user_email,
      }));

      setDataUser(users);
    } catch (error) {
      console.error("โหลดข้อมูลล้มเหลว:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Box marginBottom={3}>
        <Divider
          textAlign="left"
          sx={{
            color: "#144ad0",
            fontSize: { xs: 20, md: 28 },
            width: "100%",
          }}
        >
          Personal
        </Divider>
      </Box>
      <Grid container spacing={3}>
        {dataUser.map((user) => (
          <Grid size={{ xs: 12, md: 6 }} key={user.userId}>
            <Card
              sx={{
                display: "flex",
                boxShadow: 3,
                borderRadius: 3,
                alignItems: "center",
                bgcolor: "#f9f9f9",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: 150,
                  height: 150,
                  objectFit: "cover",
                  borderRadius: "12px",
                  margin: 1,
                  backgroundColor: "#fff",
                }}
                image={user.userImg || logo}
                alt={user.userNickname}
              />
              <CardContent sx={{ flex: 1, padding: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {user.userFullname}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {user.userJobPosition} ({user.userJobStatus})
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Nickname:</strong> {user.userNickname}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Phone:</strong> {user.userPhone}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Email:</strong> {user.userEmail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Personal;
