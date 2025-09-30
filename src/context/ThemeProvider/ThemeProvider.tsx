// ThemeContext.tsx
import React, { createContext, useMemo, useState, useContext } from 'react';
import { createTheme, ThemeProvider, CssBaseline, ThemeOptions, responsiveFontSizes } from '@mui/material';
import { PaletteMode } from '@mui/material';

const ThemeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const themeMode = window.localStorage.getItem('mode');
    const [mode, setMode] = useState<PaletteMode>((themeMode as PaletteMode) || 'light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const mode = prevMode === 'light' ? 'dark' : 'light';
                    window.localStorage.setItem('mode', mode);
                    return mode;
                });
            },
        }),
        []
    );

    const themeConfigMode: Record<string, ThemeOptions> = {
        dark: {
            palette: {
                mode: 'dark',
                primary: {
                    main: '#002884',
                    light: '#2196F3',
                    dark: '#002884',
                    contrastText: '#fff',
                },
                secondary: {
                    light: '#ffffff',
                    main: '#ffffff',
                    dark: '#ffffff',
                    contrastText: '#000',
                },
            },
        },
        light: {
            palette: {
                mode: 'light',
                primary: {
                    main: '#144da0',
                    light: '#2196F3',
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
            components: {
                MuiButton: {
                    styleOverrides: {
                        outlinedSecondary: {
                            borderColor: '#144da0',
                            color: '#144da0',
                            '&:hover': {
                                color: '#fff',
                                backgroundColor: '#144da0',
                            },
                        },
                    },
                },
            },
        },
    };

    let theme = useMemo(
        () =>
            createTheme({
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
                    MuiCssBaseline: {
                        styleOverrides: (theme) => ({
                            html: {
                                fontFamily: 'Sarabun, Arial, sans-serif',
                                fontSize: '14px',
                                [theme.breakpoints.up('md')]: {
                                    fontSize: '16px', // increase base size at md+
                                },
                            },
                        }),
                    },
                    ...themeConfigMode[mode]['components'],
                },
                palette: {
                    ...themeConfigMode[mode]['palette'],
                },
                typography: {
                    fontFamily: 'Sarabun, Arial, sans-serif',
                },
            }),
        [mode]
    );

    // make typography scale automatically between breakpoints
    theme = responsiveFontSizes(theme, {
        factor: 2, // scaling factor (default = 2)
    });

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
