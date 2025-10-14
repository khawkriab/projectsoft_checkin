import { Box, FormControlLabel, IconButton, Switch, useTheme } from '@mui/material';
import { useColorMode } from 'context/ThemeProvider';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function SwitchThemeModeButton() {
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();

    //
    return (
        <Box display={'flex'} sx={{ gap: 1 }} alignItems={'center'} overflow={'hidden'}>
            <FormControlLabel
                sx={{
                    '&.MuiFormControlLabel-root': {
                        marginRight: 0,
                        marginLeft: 0,
                    },
                }}
                control={
                    <Switch
                        sx={(theme) => ({
                            width: 'auto',
                            height: '34px',
                            padding: '10px 12px',

                            '& .MuiSwitch-switchBase': {
                                padding: 0,
                                bottom: 0,
                                backgroundColor: '#ffffff',
                                '&.Mui-checked': {
                                    transform: 'translateX(48px)',
                                    backgroundColor: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#ffffff',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: '#ffffff',
                                },

                                '& .MuiIconButton-root': {
                                    width: '34px',
                                    height: '34px',
                                },
                            },
                            '& .MuiSwitch-track': {
                                width: '60px',
                            },
                        })}
                        icon={
                            <IconButton size='small' color='primary'>
                                <LightModeIcon />
                            </IconButton>
                        }
                        checkedIcon={
                            <IconButton size='small' color='primary'>
                                <DarkModeIcon />
                            </IconButton>
                        }
                        checked={theme.palette.mode === 'dark'}
                        onChange={toggleColorMode}
                    />
                }
                label={''}
            />
        </Box>
    );
}

export default SwitchThemeModeButton;
