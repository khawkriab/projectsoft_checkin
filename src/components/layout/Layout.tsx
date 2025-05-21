import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "./dino_logo.png";
import React, { useEffect, useRef, useState, useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useFetcher from "../../hooks/useFetcher/useFetcher";
import { useGoogleLogin } from "components/GoogleLoginProvider";
import { GoogleLoginContext } from "../GoogleLoginProvider/GoogleLoginProvider";

interface LayoutProps {
  onProfileLoad: (profileData: {
    fullName: string;
    email: string;
    id: string;
    idToken: string;
  }) => void;
}

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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
        <Typography variant="h6">Menu</Typography>
      </Stack>
      <Divider />
      <List>
        {navLinks.map(({ label, path }) => (
          <ListItem
            key={path}
            onClick={() => navigate(path)}
            component="button"
          >
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#144da0", height: { xs: 64, sm: 80 } }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            height: "100%",
            px: { xs: 1, sm: 3 },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Hamburger menu for mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "50px",
                paddingLeft: 8,
                paddingRight: 8,
              }}
            />

            {/* Nav links for desktop */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
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

          {/* Right-side profile and auth */}
          <Stack direction="row" spacing={1} alignItems="center">
            {!authLoaded ? (
              <Typography color="white" variant="body2">
                Loading...
              </Typography>
            ) : signinStatus && profile ? (
              <>
                <Avatar
                  alt={profile.fullName}
                  src={profile.profileURL}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography
                  color="white"
                  variant="body2"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {profile.fullName}
                </Typography>
                <IconButton
                  onClick={onLogoutGoogle}
                  sx={{ bgcolor: "#f44336", color: "white" }}
                  size="small"
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={onLoginGoogle}
              >
                Sign In
              </button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile view */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ p: { xs: 1, sm: 2 } }}>
        <Outlet />
      </Box>
    </>
  );
}

export default Layout;
