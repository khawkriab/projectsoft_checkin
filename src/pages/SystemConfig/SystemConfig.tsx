import { Box, Button, Checkbox, FormControlLabel, Grid, Stack, TextField } from '@mui/material';
import { DesktopTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import {
    getSystemAreaConfig,
    getSystemWeeklyWorkingDaysConfig,
    getSystemWorkTimesConfig,
    updetSystemAreaConfig,
    updetSystemWeeklyWorkingDaysConfig,
    updetSystemWorkTimesConfig,
} from 'context/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { SystemAreaConfig, WeeklyWorkingDays, WorkTimes } from 'type.global';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useNotification } from 'components/common/NotificationCenter';

dayjs.extend(customParseFormat);

const libraries = ['marker'];

function SystemConfig() {
    const { openNotify } = useNotification();
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
        mapIds: [process.env.REACT_APP_GOOGLE_MAPS_ID as string],
    });
    //
    const radiusCircle = useRef<google.maps.Circle>(null);
    const [isSending, setIsSending] = useState(false);
    const [areaConfig, setAreaConfig] = useState<SystemAreaConfig | null>(null);
    const [workTimes, setWorkTimes] = useState<WorkTimes>({
        entryTime: '00:00',
        exitTime: '00:00',
    }); // HH:mm
    const [weeklyWorkingDays, setWeeklyWorkingDays] = useState<WeeklyWorkingDays>({
        Friday: false,
        Monday: false,
        Saturday: false,
        Sunday: false,
        Thursday: false,
        Tuesday: false,
        Wednesday: false,
    });
    //

    const onSave = async (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSending(true);
        try {
            await updetSystemWeeklyWorkingDaysConfig(weeklyWorkingDays);
            if (areaConfig)
                await updetSystemAreaConfig({
                    lat: Number(areaConfig.lat),
                    lng: Number(areaConfig.lng),
                    radius: Number(areaConfig.radius),
                });
            if (workTimes) await updetSystemWorkTimesConfig(workTimes);

            openNotify('success', 'update saved');
        } catch (error) {
            console.error('error:', error);
        }
        setIsSending(false);
    };

    const onChangeAreaConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAreaConfig((prev) => ({ ...(prev ? prev : ({} as SystemAreaConfig)), [event.target.name]: event.target.value }));

        if (radiusCircle.current) {
            if (areaConfig && (event.target.name === 'lat' || event.target.name === 'lng')) {
                const latlng = { lat: areaConfig.lat, lng: areaConfig.lng };
                radiusCircle.current.setCenter({ ...latlng, [event.target.name]: Number(event.target.value) });
            }
            if (areaConfig && event.target.name === 'radius') {
                radiusCircle.current.setRadius(Number(event.target.value));
            }
        }
    };

    const onSetWeeklyWorkingDays = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWeeklyWorkingDays((prev) => ({ ...prev, [event.target.name]: event.target.checked }));
    };

    useEffect(() => {
        const getAreaConfig = async () => {
            try {
                const res = await getSystemAreaConfig();
                const wwd = await getSystemWeeklyWorkingDaysConfig();
                const wt = await getSystemWorkTimesConfig();

                setWorkTimes(wt);
                setWeeklyWorkingDays((prev) => ({ ...prev, ...wwd }));
                setAreaConfig({ ...res });

                if (radiusCircle.current) {
                    const latlng = { lat: res.lat, lng: res.lng };
                    radiusCircle.current.setCenter({ ...latlng });

                    radiusCircle.current.setRadius(res.radius);
                }
            } catch (error) {
                console.error('error:', error);
            }
        };

        getAreaConfig();
    }, []);

    return (
        <Box component={'form'} onSubmit={onSave}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box width={{ xs: '100%', md: '50%' }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '400px',
                        }}
                    >
                        {isLoaded && areaConfig && (
                            <GoogleMap
                                options={{
                                    mapId: process.env.REACT_APP_GOOGLE_MAPS_STYLE_ID,
                                    // disableDefaultUI: true,
                                    // mapTypeId: 'hybrid',
                                }}
                                mapContainerStyle={{
                                    width: '100%',
                                    height: '400px',
                                }}
                                zoom={17}
                                center={{ lat: Number(areaConfig.lat), lng: Number(areaConfig.lng) }}
                                onLoad={(map) => {
                                    if (!radiusCircle.current) {
                                        radiusCircle.current = new google.maps.Circle({
                                            map,
                                            center: { lat: areaConfig.lat, lng: areaConfig.lng },
                                            radius: areaConfig.radius, // in meters
                                            fillColor: '#FF0000',
                                            fillOpacity: 0.2,
                                            strokeColor: '#FF0000',
                                            strokeOpacity: 0.7,
                                            strokeWeight: 2,
                                        });
                                    }
                                }}
                            />
                        )}
                    </Box>
                    <Grid container spacing={2} flex={'auto'} minWidth={'280px'} marginTop={'24px'}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                required
                                fullWidth
                                name='radius'
                                label='รัศมี'
                                value={areaConfig?.radius || ''}
                                onChange={onChangeAreaConfig}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                required
                                fullWidth
                                name='lat'
                                label='lat'
                                value={areaConfig?.lat || 0}
                                onChange={onChangeAreaConfig}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                required
                                fullWidth
                                name='lng'
                                label='lng'
                                value={areaConfig?.lng || 0}
                                onChange={onChangeAreaConfig}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box width={{ xs: '100%', md: '50%' }}>
                    <Box>เวลาทำงาน</Box>
                    <Stack direction={'row'} spacing={2} marginTop={'12px'} zIndex={99} position={'relative'}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopTimePicker
                                label='เวลาเข้างาน'
                                ampm={false}
                                timeSteps={{ minutes: 1 }}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        name: 'entryTime',
                                        // required: !updateDataForm.time && !updateDataForm.remark,
                                        // error: !updateDataForm.time && !updateDataForm.remark,
                                        fullWidth: true,
                                        value: dayjs(workTimes?.entryTime || '00:00', 'HH:mm'),
                                    },
                                }}
                                onChange={(newValue) => {
                                    setWorkTimes((prev) => ({
                                        ...prev,
                                        entryTime: newValue ? dayjs(newValue).format('HH:mm') : '',
                                    }));
                                }}
                            />
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopTimePicker
                                label='เวลาออกงาน'
                                ampm={false}
                                timeSteps={{ minutes: 1 }}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        name: 'exitTime',
                                        // required: !updateDataForm.time && !updateDataForm.remark,
                                        // error: !updateDataForm.time && !updateDataForm.remark,
                                        fullWidth: true,
                                        value: dayjs(workTimes?.exitTime || '00:00', 'HH:mm'),
                                    },
                                }}
                                onChange={(newValue) => {
                                    setWorkTimes((prev) => ({
                                        ...prev,
                                        exitTime: newValue ? dayjs(newValue).format('HH:mm') : '',
                                    }));
                                }}
                            />
                        </LocalizationProvider>
                    </Stack>
                    <Box marginTop={'24px'}>วันทำงาน</Box>
                    <Stack pl={1}>
                        <FormControlLabel
                            control={<Checkbox name='Sunday' checked={weeklyWorkingDays.Sunday} onChange={onSetWeeklyWorkingDays} />}
                            label='อาทิตย์'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Monday' checked={weeklyWorkingDays.Monday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันจันทร์'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Tuesday' checked={weeklyWorkingDays.Tuesday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันอังคาร'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Wednesday' checked={weeklyWorkingDays.Wednesday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันพุธ'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Thursday' checked={weeklyWorkingDays.Thursday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันพฤหัสบดี'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Friday' checked={weeklyWorkingDays.Friday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันศุกร์'
                        />
                        <FormControlLabel
                            control={<Checkbox name='Saturday' checked={weeklyWorkingDays.Saturday} onChange={onSetWeeklyWorkingDays} />}
                            label='วันเสาร์'
                        />
                    </Stack>
                </Box>
            </Stack>
            <Box display={'flex'} marginTop={'24'} justifyContent={'flex-end'}>
                <Button type='submit' variant='contained' color='primary' loading={isSending}>
                    Save
                </Button>
            </Box>
        </Box>
    );
}

export default SystemConfig;
