import { NavLink, Outlet } from "react-router-dom";
import logo from "./dino_logo.png";
import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import { gapi } from "gapi-script";

interface LayoutProps {
  onProfileLoad: (profileData: {
    fullName: string;
    email: string;
    id: string;
    idToken: string;
  }) => void;
}

declare type gapi = any;
const navLinks = [
  { label: "Check-in", path: "/Checkin" },
  { label: "Schedule", path: "/Schedule" },
  { label: "Personal", path: "/Personal" },
  { label: "Summary", path: "/Summary" },
  { label: "Absent", path: "/Absent" },
  { label: "Register", path: "/Register" },
];

type ProfileData = {
  id: string;
  fullName: string;
  profileURL: string;
  email: string;
};

function Layout({ onProfileLoad }: LayoutProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const initClient = () => {
    const clientId =
      "617287579060-66r4kae3sergkb7bv933ipkekpg1l8a6.apps.googleusercontent.com";
    const apiKey = "AIzaSyC5wYRXYMuUGQGchOqgtreNx2y3bf2eTic";

    gapi.client
      .init({
        apiKey,
        clientId,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();

        if (authInstance.isSignedIn.get()) {
          const googleUser = authInstance.currentUser.get();
          console.log("googleUser:", googleUser);

          const profile = googleUser.getBasicProfile();
          const idToken = googleUser.getAuthResponse().id_token;
          console.log("idToken:", idToken);

          setProfile({
            id: profile.getId(),
            fullName: profile.getName(),
            profileURL: profile.getImageUrl(),
            email: profile.getEmail(),
          });

          onProfileLoad({
            fullName: profile.getName(),
            email: profile.getEmail(),
            id: profile.getId(),
            idToken: idToken,
          });
          console.log("onProfileLoad:", onProfileLoad);
        }
        console.log("hello");
        setIsSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsSignedIn);
        setAuthLoaded(true);
      })
      .catch((error: any) => {
        console.error("Error initializing Google API client:", error);
      });
  };

  const handleSignIn = () => {
    console.log("handleSignIn:");
    gapi.auth2
      .getAuthInstance()
      .signIn()
      .then((user: any) => {
        console.log("user:", user);
        const profile = user.getBasicProfile();
        console.log("profile:", profile);

        setProfile({
          id: profile.getId(),
          fullName: profile.getName(),
          profileURL: profile.getImageUrl(),
          email: profile.getEmail(),
        });
      })
      .catch((error: any) => {
        alert("Sign-in error");
      });

    // console.log('authInstance:', authInstance)
    // if (authInstance.isSignedIn.get()) {
    //   const googleUser = authInstance.currentUser.get();
    //   const profile = googleUser.getBasicProfile();
    //   console.log("profile:", profile);
    //   //console.log("profile:", profile);

    //   setProfile({
    //     id: profile.getId(),
    //     fullName: profile.getName(),
    //     profileURL: profile.getImageUrl(),
    //     email: profile.getEmail(),
    //   });
    // }
  };

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
    setProfile({} as ProfileData);
  };

  useEffect(() => {
    gapi.load("client:auth2", initClient);
  }, []);

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#144da0", height: 80 }}>
        <Toolbar sx={{ justifyContent: "space-between", height: "100%" }}>
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{ height: "100%" }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "60px",
                paddingLeft: "60px",
                paddingRight: "60px",
              }}
            />
            <Stack direction="row" spacing={3}>
              {navLinks.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  style={({ isActive }) => ({
                    color: "#fff",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #fff" : "none",
                    paddingBottom: "5px",
                    fontWeight: 500,
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {!authLoaded ? (
              <Typography color="white">Loading...</Typography>
            ) : isSignedIn && profile ? (
              <>
                <Avatar alt={profile.fullName} src={profile.profileURL} />
                {console.log("profile.profileURL:", profile.profileURL)}
                <Typography color="white">{profile.fullName}</Typography>
                <IconButton
                  onClick={handleSignOut}
                  sx={{ bgcolor: "#f44336", color: "white" }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleSignIn}>
                Sign In to Google
              </button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </>
  );
}

export default Layout;
