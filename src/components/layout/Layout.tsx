import { NavLink, Outlet } from "react-router-dom";
import logo from "./dino_logo.png";
import React, { useEffect, useState } from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { gapi } from "gapi-script";

const navLinks = [
  { label: "Checkin", path: "/Checkin" },
  { label: "Summary", path: "/Summary" },
  { label: "Schedule", path: "/Schedule" },
  { label: "Personal", path: "/Personal" },
  { label: "Absent", path: "/Absent" },
];

type ProfileData = {
  id: string;
  fullName: string;
  profileURL: string;
  email: string;
};

function Layout() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [profile, setProfile] = useState<ProfileData>();
  const initClient = () => {
    const clientId =
      "617287579060-66r4kae3sergkb7bv933ipkekpg1l8a6.apps.googleusercontent.com";
    const apiKey = "AIzaSyC5wYRXYMuUGQGchOqgtreNx2y3bf2eTic";
    gapi.client
      .init({
        apiKey: apiKey,
        clientId: clientId,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();

        if (authInstance.isSignedIn.get()) {
          console.log("authInstance:", authInstance.currentUser.get());
          const googleUser = authInstance.currentUser.get();
          console.log("googleUser:", googleUser.getBasicProfile());

          const profile = googleUser.getBasicProfile();

          console.log("ID: " + profile.getId()); // Google's unique ID for the user

          console.log("Full Name: " + profile.getName()); // Full name
          console.log("Image URL: " + profile.getImageUrl()); // Profile picture
          console.log("Email: " + profile.getEmail()); // Email address
        }
        setIsSignedIn(authInstance.isSignedIn.get());
        console.log(
          "authInstance.isSignedIn.get():",
          authInstance.isSignedIn.get()
        );

        authInstance.isSignedIn.listen(setIsSignedIn);
        setAuthLoaded(true);
      })
      .catch((error: any) => {
        console.error("Error initializing Google API client:", error);
      });
  };

  const handleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  useEffect(() => {
    gapi.load("client:auth2", initClient);
  }, []);

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#144da0", height: 80 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <img src={logo} alt="Logo" style={{ height: "60px" }} />

            <Stack direction="row" spacing={2}>
              {navLinks.map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  style={({ isActive }) => ({
                    color: "#fff",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #fff" : "none",
                    paddingBottom: "2px",
                    fontWeight: 500,
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </Stack>
          </Stack>

          <div>
            {!authLoaded ? (
              <div>Loading...</div>
            ) : isSignedIn ? (
              <div>
                <div className="form-group d-flex">
                  <p className="mt-auto mb-0 me-3">You are signed in!</p>
                  <button
                    className="btn btn-danger btn-sm d-inline-block"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </div>

                <div style={{ display: "flex" }}></div>
              </div>
            ) : (
              <div>
                <button className="btn btn-primary" onClick={handleSignIn}>
                  Sign In to Google
                </button>
              </div>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </>
  );
}

export default Layout;
