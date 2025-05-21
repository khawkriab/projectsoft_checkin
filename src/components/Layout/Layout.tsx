// import {
//   AppBar,
//   Box,
//   Grid,
//   Menu,
//   MenuItem,
//   Toolbar,
//   Typography,
// } from "@mui/material";
// import { Outlet } from "react-router-dom";

// function Layout() {
//   return (
//     <Box sx={{ width: "100%" }}>
//       <AppBar position="relative" sx={{ height: "75px", padding: "0 24px" }}>
//         <Grid container height={"100%"} alignItems={"center"}>
//           <Grid size="grow">
//             <Typography variant="h6" noWrap>
//               Projectsoft Check-In :)
//             </Typography>
//             <Menu
//               open
//               //   anchorOrigin={{
//               //     vertical: "bottom",
//               //     horizontal: "left",
//               //   }}
//               //   keepMounted
//               //   transformOrigin={{
//               //     vertical: "top",
//               //     horizontal: "left",
//               //   }}
//               //   open={Boolean(anchorElNav)}
//               //   onClose={handleCloseNavMenu}
//               //   sx={{ display: { xs: "block", md: "none" } }}
//             >
//               <MenuItem>
//                 <Typography sx={{ textAlign: "center" }}>{"Home"}</Typography>
//               </MenuItem>
//             </Menu>
//           </Grid>
//           <Grid size="auto">
//             <Typography variant="h6" noWrap>
//               Projectsoft Check-In :)
//             </Typography>
//           </Grid>
//         </Grid>
//       </AppBar>
//       <Box component={"main"} sx={{ padding: "24px" }}>
//         <Outlet />
//       </Box>
//     </Box>
//   );
// }

// export default Layout;
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
// import MenuIcon from '@mui/icons-material/Menu';

const pages = ["Home", "About", "Services", "Contact"];

export default function Layout() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          {/* Left side: brand/logo */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              textDecoration: "none",
              color: "inherit",
            }}
          >
            MyApp
          </Typography>

          {/* Mobile Menu Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              {/* <MenuIcon /> */}
            </IconButton>
            <Menu
              open
              //   id="menu-appbar"
              //   anchorEl={anchorElNav}
              //   open={Boolean(anchorElNav)}
              //   onClose={handleCloseNavMenu}
              //   anchorOrigin={{
              //     vertical: "bottom",
              //     horizontal: "left",
              //   }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop Menu */}
          {/* <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
