import { NavLink, Outlet } from "react-router-dom";
import logo from "./dino_logo.png";
import React, { useEffect, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import useFetcher from "../../hooks/useFetcher/useFetcher";
import { useGoogleLogin } from "components/GoogleLoginProvider";
import { useContext } from "react";
import { GoogleLoginContext } from "../GoogleLoginProvider/GoogleLoginProvider";
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
  { label: "Map", path: "/Map" },
];

function Layout({ onProfileLoad }: LayoutProps) {
  const { profile, onLoginGoogle, onLogoutGoogle, authLoaded, signinStatus } =
    useGoogleLogin();
  const { POST } = useFetcher();
  const hasPostedAuth = useRef(false);
  const { setRoleId } = useContext(GoogleLoginContext);

  useEffect(() => {
    if (
      signinStatus &&
      profile?.token &&
      profile?.id &&
      !hasPostedAuth.current
    ) {
      hasPostedAuth.current = true;

      onProfileLoad({
        fullName: profile.fullName,
        email: profile.email,
        id: profile.id,
        idToken: profile.token,
      });

      POST(
        "/user/authentication",
        {},
        {
          headers: {
            "user-id-token": profile.token,
            "user-id": profile.id,
          },
        }
      )
        .then((res) => {
          console.log("Authentication success:", res);

          const roleId = res?.role_id;
          if (roleId !== undefined) {
            setRoleId(roleId);
          }
        })
        .catch((err) => {
          console.error("Authentication error:", err);
        });
    }
  }, [signinStatus, profile, POST, onProfileLoad]);

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
            ) : signinStatus && profile ? (
              <>
                <Avatar alt={profile.fullName} src={profile.profileURL} />
                <Typography color="white">{profile.fullName}</Typography>
                <IconButton
                  onClick={onLogoutGoogle}
                  sx={{ bgcolor: "#f44336", color: "white" }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <button className="btn btn-primary" onClick={onLoginGoogle}>
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
