// ThemeContext.tsx
import React, { createContext, useMemo, useState, useContext } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { PaletteMode } from "@mui/material";

const ThemeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#144da0",
          },
          secondary: {
            main: "#ffffff",
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
