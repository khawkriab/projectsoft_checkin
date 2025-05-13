import RoutesManagement from "RoutesManagement";
import "./App.css";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { GoogleLoginProvider } from "components/GoogleLoginProvider";

// const theme = createTheme({
//   components: {
//     MuiOutlinedInput: {
//       styleOverrides: {
//         root: {
//           palette: {
//             primary: {
//               main: "#144da0",
//             },
//             secondary: {
//               main: "#37b4d1",
//             },
//           },
//         },
//       },
//     },
//   },
// });

/*
  color 
  primary #144da0
  secondary #37b4d1
  text-default #4b4b4b
  text-title #primary
  text-secondary #ffffff
  btn-bg-secondary #ffffff
  btn-bg #144da0
  btn-bg-danger #f7374f
  input-bg #ffffff
*/

const theme = createTheme({
  palette: {
    primary: {
      main: "#144da0",
    },
    secondary: {
      main: "#37b4d1",
    },
    background: {
      default: "#ffffff", // พื้นหลังโดยรวม เช่น input-bg, btn-bg-secondary
      paper: "#ffffff", // พื้นหลังของกระดาษ (เช่น Card, Modal ฯลฯ)
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.secondary.main,
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
        sizeMedium: {
          height: 40,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GoogleLoginProvider>
        <RoutesManagement />
      </GoogleLoginProvider>
    </ThemeProvider>
  );
}

export default App;
