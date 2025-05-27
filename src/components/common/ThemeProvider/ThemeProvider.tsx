// ThemeContext.tsx
import React, { createContext, useMemo, useState, useContext } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { PaletteMode } from '@mui/material';

const ThemeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<PaletteMode>('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        []
    );

    const themeColor = {
        dark: {
            primary: {
                main: '#002884',
                light: '#757ce8',
                dark: '#002884',
                contrastText: '#fff',
            },
            secondary: {
                light: '#ffffff',
                main: '#ffffff',
                dark: '#ffffff',
                contrastText: '#fff',
            },
        },
        light: {
            primary: {
                main: '#144da0',
                light: '#757ce8',
                dark: '#002884',
                contrastText: '#fff',
            },
            secondary: {
                light: '#ffffff',
                main: '#ffffff',
                dark: '#ffffff',
                contrastText: '#444',
            },
        },
    };

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...themeColor[mode],
                },
                components: {
                    MuiTextField: {
                        defaultProps: {
                            slotProps: {
                                inputLabel: {
                                    shrink: true,
                                },
                            },
                        },
                    },
                    // MuiTableCell: {
                    //     styleOverrides: {
                    //         root: ({ theme }) => ({
                    //             borderBottom: `1px solid ${theme.palette.secondary.contrastText}`, // Use theme color
                    //         }),
                    //     },
                    // },
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
