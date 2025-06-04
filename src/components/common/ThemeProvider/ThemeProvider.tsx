// ThemeContext.tsx
import React, { createContext, useMemo, useState, useContext } from 'react';
import { createTheme, ThemeProvider, CssBaseline, ThemeOptions } from '@mui/material';
import { PaletteMode } from '@mui/material';

const ThemeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<PaletteMode>('dark');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
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
                    light: '#757ce8',
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

    const theme = useMemo(
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
                    ...themeConfigMode[mode]['components'],
                    // MuiTableCell: {
                    //     styleOverrides: {
                    //         root: ({ theme }) => ({
                    //             borderBottom: `1px solid ${theme.palette.secondary.contrastText}`, // Use theme color
                    //         }),
                    //     },
                    // },
                },
                palette: {
                    ...themeConfigMode[mode]['palette'],
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
