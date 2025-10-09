import { CheckCircle, ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    BoxProps,
    Button,
    CardMedia,
    Grid,
    IconButton,
    Modal,
    Stack,
    styled,
    TextField,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersCalendarHeaderProps, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DateTime from 'components/common/DateTime/DateTime';
import dayjs, { Dayjs } from 'dayjs';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useEffect, useRef, useState } from 'react';
import { getCalendarConfig, getUserWorkTime, updateWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { useFirebase } from 'context/FirebaseProvider';
import { CheckinDate, LatLng } from 'type.global';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { AdvancedMarker } from 'components/common/GoogleMaps';
import { css, keyframes } from '@emotion/react';
import RefreshIcon from '@mui/icons-material/Refresh';
import isWithinRadius from 'helper/checkDistance';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import { deviceDetect } from 'react-device-detect';

type StatusCode = keyof typeof STATUS;

type CheckinDataExtend = Record<string, (CheckinDate & { statusCode: StatusCode }) | null>;

export const STATUS = {
    // TODAY: { code: 'TODAY', label: 'วันนี้', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    NORMAL: { code: 'NORMAL', label: 'ปกติ', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    LATE: { code: 'LATE', label: 'สาย', color: 'var(--status-late-color)', bgc: 'var(--status-late-bgc)' },
    LEAVE: { code: 'LEAVE', label: 'ลา', color: 'var(--status-leave-color)', bgc: 'var(--status-leave-bgc)' },
    HOLIDAY: { code: 'HOLIDAY', label: 'วันหยุด', color: 'var(--status-holiday-color)', bgc: 'var(--status-holiday-bgc)' },
    ABSENT: { code: 'ABSENT', label: 'ขาด', color: 'var(--status-miss-color)', bgc: 'var(--status-miss-bgc)' },
} as const;

const dataList: Record<string, StatusCode> = {
    [dayjs().format('YYYY-MM-DD')]: 'NORMAL',
    '2025-09-18': 'NORMAL',
    '2025-09-19': 'LATE',
    '2025-09-10': 'LEAVE',
    '2025-09-11': 'HOLIDAY',
};

const libraries = ['places', 'marker'];

function HomeLanding() {
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    const { profile } = useFirebase();
    //
    const [checkInCalendar, setCheckInCalendar] = useState<CheckinDataExtend>({});
    const [dateSelect, setDateSelect] = useState(dayjs().format('YYYY-MM-DD'));
    //

    useEffect(() => {
        const init = async () => {
            if (!profile?.email) return;

            const c = await getCalendarConfig({ id: dayjs().format('YYYY-M') });
            const res = await getUserWorkTime({
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().format('YYYY-MM-DD'),
                email: profile?.email,
            });

            if (!res) return;
            const grouped: CheckinDataExtend = {};

            c.forEach((data) => {
                const td = res.find((f) => f.date === data.date);

                if (dayjs(data.date).isAfter(dayjs())) return;

                if (!grouped[data.date]) grouped[data.date] = null;
                if (td) {
                    let statusCode: StatusCode = 'NORMAL';
                    if (td && dayjs(`${td.date} ${td.time}`).isAfter(dayjs(`${data.date} ${data.entryTime}`))) statusCode = 'LATE';

                    if (td.absentId) statusCode = 'LEAVE';

                    grouped[data.date] = { ...td, statusCode: statusCode };
                } else {
                    grouped[data.date] = {
                        googleId: '',
                        email: '',
                        name: '',
                        date: data.date,
                        statusCode: 'ABSENT',
                        status: 0,
                        approveBy: '',
                        approveByGoogleId: '',
                    };
                }
            });
            // res.forEach((data) => {
            //     let statusCode: StatusCode = 'NORMAL';
            //     if (data.absentId) statusCode = 'LEAVE';

            //     const td = c.find((f) => f.date === data.date);

            //     if (td && dayjs(`${data.date} ${data.time}`).isAfter(dayjs(`${td.date} ${td.entryTime}`))) statusCode = 'LATE';

            //     const isBeforeDay = dayjs(data.date).isBefore(dayjs().add(-1, 'day'));
            //     if (!data.remark && !data.time && isBeforeDay) statusCode = 'ABSENT';
            //     console.log('statusCode:', statusCode);
            //     //
            //     if (!grouped[data.date]) grouped[data.date] = { ...data, statusCode: statusCode };
            // });

            setCheckInCalendar({ ...grouped });
        };

        init();
    }, [profile?.email]);

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                minHeight: '100vh',
                flexDirection: 'column',
                fontFamily: `'Sarabun', sans-serif`,
                position: 'relative',
                overflow: 'hidden',
                // CSS variables for status colors and backgrounds
                '--status-leave-color': '#FF9800',
                '--status-leave-bgc': '#FFE2C6',
                '--status-miss-color': '#D32F2F',
                '--status-miss-bgc': '#FFDBDC',
                '--status-holiday-color': '#000000',
                '--status-holiday-bgc': '#E0E0E0',
                '--status-late-color': '#FBBC04',
                '--status-late-bgc': '#FEF9C3',
                '--status-normal-color': '#34A853',
                '--status-normal-bgc': '#DCFCE7',
                '--main-accent': theme.palette.primary.main,

                '::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    backgroundImage: 'url(images/four_circles_no_overlap.svg)',
                    // backgroundImage: { xs: 'url(images/three_circles.svg)', lg: 'url(images/four_circles_no_overlap.svg)' },
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: { xs: 'cover' },
                    // filter: 'blur(5px)',
                },

                // Make sure content is above the blurred bg
                // '& > *': {
                //     position: 'relative',
                //     zIndex: 1,
                // },
            })}
        >
            <HomeAppBar />
            <Box className='body-content' padding={'12px'}>
                {/* date */}
                {!desktopSize && <TodayCheckIn />}
                <Grid container spacing={2} direction={{ xs: 'column', lg: 'row' }}>
                    {/* calendar */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box
                            sx={{
                                boxShadow: { xs: 'none', lg: '0 0 10px 10px #bababa3b' },
                                backgroundColor: { xs: 'transparent', lg: '#ffffff' },
                                overflow: { xs: 'visible', lg: 'hidden' },
                                borderRadius: '12px',
                                mb: '24px',
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    value={dayjs()}
                                    autoFocus={false}
                                    // showDaysOutsideCurrentMonth
                                    // fixedWeekNumber={6}
                                    sx={(theme) => ({
                                        '.MuiDayCalendar-root': {
                                            boxShadow: { xs: '0 0 10px 10px #bababa3b', lg: 'none' },
                                            backgroundColor: { xs: '#ffffff', lg: 'transparent' },
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            marginTop: '12px',
                                            padding: '12px',
                                        },
                                        '&.MuiDateCalendar-root': {
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: 'unset',
                                            overflow: 'visible',
                                        },

                                        '& .MuiPickersDay-root': {
                                            margin: 0,
                                            opacity: 1,
                                        },
                                        '& .MuiDayCalendar-weekContainer': {
                                            margin: 0,
                                        },
                                        '& .MuiDayCalendar-weekDayLabel': {
                                            width: '100%',
                                            paddingTop: '12px',
                                            paddingBottom: '24px',
                                            minHeight: '40px',
                                            height: 'auto',
                                            fontWeight: 600,
                                            color: '#000000',
                                            fontSize: theme.typography.h6.fontSize,
                                        },
                                    })}
                                    slots={{
                                        calendarHeader: CustomCalendarHeader, // 👈 override header
                                        day: (dayProps) => <CustomDay dataList={checkInCalendar} desktopSize={desktopSize} {...dayProps} />,
                                    }}
                                    // slots={{
                                    //     day: (dayProps) => (
                                    //         <ServerDay
                                    //             {...dayProps}
                                    //             role={profile?.role}
                                    //             datesSelected={datesSelected}
                                    //             onAddMarkWFH={(date: number, wfhFlag: boolean) => {
                                    //                 if (profile?.role === 'ADMIN') {
                                    //                     let n = [...datesSelected];
                                    //                     const indexOfDate = n.findIndex((f) => f.date === date);

                                    //                     if (indexOfDate >= 0) {
                                    //                         n[indexOfDate].wfhFlag = wfhFlag;
                                    //                     }

                                    //                     setDatesSelected([...n]);
                                    //                 }
                                    //             }}
                                    //         />
                                    //     ),
                                    // }}
                                    // shouldDisableDate={(day) => {
                                    //     const date = day.date();
                                    //     const hasData = currentFromDatabase.filter((f) => f.userCheckinList.length > 0);
                                    //     return hasData.map((m) => m.date).includes(date);
                                    // }}
                                    // onMonthChange={(m) => {
                                    //     setMonth(m.get('months'));
                                    //     setYears(m.get('years'));
                                    // }}
                                    onChange={(newValue) => {
                                        const date = newValue?.format('YYYY-MM-DD');
                                        if (date) {
                                            setDateSelect(date);
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                            {/* status */}
                            <Box display={'flex'} gap={'12px'} padding={'12px'} justifyContent={{ xs: 'flex-start', lg: 'center' }}>
                                <StatusBox color='var(--status-normal-color)' bgc='var(--status-normal-bgc)' label='ปกติ' />
                                <StatusBox color='var(--status-late-color)' bgc='var(--status-late-bgc)' label='สาย' />
                                <StatusBox color='var(--status-leave-color)' bgc='var(--status-leave-bgc)' label='ลา' />
                                <StatusBox color='var(--status-holiday-color)' bgc='var(--status-holiday-bgc)' label='วันหยุด' />
                                <StatusBox color='var(--status-miss-color)' bgc='var(--status-miss-bgc)' label='ขาด' />
                            </Box>
                        </Box>
                        <CheckinHistory desktopSize={desktopSize} dateSelect={dateSelect} data={checkInCalendar} />
                    </Grid>
                    {/* menu */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <MenuList desktopSize={desktopSize} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

const flip = keyframes`
  0% { transform: rotateY(0deg) scale(0.7); }
  50% { transform: rotateY(360deg) scale(1.2); }
  100% { transform: rotateY(720deg) scale(1); }
`;

function FlipIcon() {
    const [flipping, setFlipping] = useState(false);

    const handleClick = () => {
        setFlipping(true);
        setTimeout(() => setFlipping(false), 1000);
    };

    return (
        <IconButton
            onClick={handleClick}
            sx={{
                perspective: '1000px',
                '& svg': {
                    animation: `${flip} 1s ease-in-out`,
                },
            }}
        >
            <CheckCircle sx={{ fontSize: '300px' }} color='success' />
        </IconButton>
    );
}

function logError(error: GeolocationPositionError) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'User denied the request for Geolocation.';
        case error.POSITION_UNAVAILABLE:
            return 'Location information is unavailable.';
        case error.TIMEOUT:
            return 'The request to get user location timed out.';
        default:
            return 'An unknown error';
    }
}

function TodayCheckIn() {
    const target: LatLng = { lat: 16.455647329319532, lng: 102.81962779039188 };
    const withinRang = 100;
    const parseData = dayjs().format('YYYY-MM-DD');

    //
    const { profile } = useFirebase();
    const watchId = useRef<number>(0);
    const [open, setOpen] = useState(false);
    const [checkAvail, setCheckAvail] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
    const [userCheckinToday, setUserCheckinToday] = useState<CheckinDate | null | undefined>(undefined);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
        libraries: libraries as any,
    });

    //
    const onCheckin = async (isWorkOutside = false, remark?: string, latlng?: LatLng) => {
        if (profile) {
            const res = await getUserWorkTime({ startDate: parseData, email: profile.email });

            const payload: CheckinDate = {
                date: parseData,
                email: profile.email,
                googleId: profile.googleId,
                name: profile.name,
                time: dayjs().format('HH:mm'),
                remark: remark ?? res?.remark ?? '',
                reason: res?.reason ?? '',
                approveBy: profile?.name ?? '',
                approveByGoogleId: profile?.googleId ?? '',
                leavePeriod: res?.leavePeriod || null,
                absentId: res?.absentId || null,
                isWorkOutside: isWorkOutside,
                status: 99,
                device: deviceDetect(undefined),
                latlng: latlng || null,
            };

            try {
                await updateWorkTime(payload, res?.id);
                // getUserCheckinToday();

                // openNotify('success', 'updated successfully');
            } catch (error) {
                console.error('error:', error);
            }
        }

        setCheckAvail(false);
        setIsLoading(false);
    };

    const getUserCheckinToday = async () => {
        try {
            const res = await getUserWorkTime({ startDate: parseData, email: profile?.email || '' });
            console.log('res:', res);

            if (res) {
                setUserCheckinToday({ ...res });
            } else {
                setUserCheckinToday(null);
            }
        } catch (error) {
            console.error('error:', error);
            setUserCheckinToday(null);
        }
    };

    useEffect(() => {
        if (checkAvail) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    console.log('watchPosition');
                    const { latitude, longitude } = position.coords;
                    const current = { lat: latitude, lng: longitude };
                    const within = isWithinRadius(current, target, withinRang); // in meters
                    setCurrentLocation(current);
                    // setIsWithin(within);
                    // onMatchTarget(within, current);
                    console.log('within:', within);
                    if (within) {
                        navigator.geolocation.clearWatch(watchId.current);
                        onCheckin();
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // onErrorLocation(logError(error));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // max time to wait for *each* update
                    maximumAge: 0, // don’t reuse cached position
                }
            );
        }

        return () => navigator.geolocation.clearWatch(watchId.current);
    }, [checkAvail]);

    useEffect(() => {
        if (profile) getUserCheckinToday();
    }, [profile]);

    const handleOpen = () => {
        setOpen(true);
        setCheckAvail(true);
    };
    const handleClose = () => setOpen(false);

    return (
        <Box component={'form'}>
            <Modal open={open} onClose={handleClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box>
                    <Box
                        sx={{
                            bgcolor: '#fff',
                            borderRadius: '100%',
                            width: '300px',
                            height: '300px',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '4px solid #878787',
                        }}
                    >
                        {isLoaded && checkAvail && (
                            <GoogleMap
                                options={{
                                    mapId: 'ab108a809fd161a2fadf6a75',
                                    disableDefaultUI: true,
                                }}
                                mapContainerStyle={{
                                    width: '100%',
                                    height: '400px',
                                }}
                                zoom={17}
                                center={target}
                                onLoad={(map) => {
                                    new google.maps.Circle({
                                        map,
                                        center: target,
                                        radius: withinRang, // in meters
                                        fillColor: '#FF0000',
                                        fillOpacity: 0.2,
                                        strokeColor: '#FF0000',
                                        strokeOpacity: 0.7,
                                        strokeWeight: 2,
                                    });
                                }}
                            >
                                <AdvancedMarker position={target} label='Target' imgUrl='images/apartmentIcon.svg' />
                                {currentLocation && (
                                    <AdvancedMarker
                                        position={currentLocation}
                                        label='You'
                                        imgUrl='images/personPinCircleIcon.svg'
                                        color='#00ff48'
                                    />
                                )}
                            </GoogleMap>
                        )}
                        {!isLoading && !checkAvail && <FlipIcon />}
                    </Box>
                    <Box
                        sx={(theme) => ({
                            mt: 1,
                            textAlign: 'center',
                            color: theme.palette.primary.contrastText,
                            fontSize: theme.typography.h5,
                        })}
                    >
                        กำลังค้นหาตำแหน่ง....
                    </Box>
                </Box>
            </Modal>
            <Box display={'flex'} flexDirection={{ xs: 'column', lg: 'column' }}>
                <Grid container spacing={1} mb={'12px'} height={{ xs: 'auto', lg: '100px' }}>
                    <Grid size={{ xs: 'grow', lg: 9 }}>
                        <Box
                            sx={(theme) => ({
                                borderRadius: '6px',
                                padding: '12px',
                                height: '100%',
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', lg: 'center' },
                                gap: '2px 12px',
                                fontSize: theme.typography.h5.fontSize,
                                color: theme.palette.primary.contrastText,
                                fontWeight: 500,
                                alignItems: { xs: 'flex-start', lg: 'center' },
                                flexDirection: { xs: 'column', md: 'row' },
                                background: { xs: 'transparent', lg: 'linear-gradient(to right, #085aff,#47D7EB)' },
                            })}
                        >
                            <Box>
                                <span>วันนี้ </span>
                                <DateTime show='date' />
                            </Box>
                            <Box>
                                <span>เวลา </span>
                                <DateTime show='time' />
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 'auto', lg: 3 }} display={'flex'} flexWrap={'wrap'} gap={'6px'}>
                        {userCheckinToday === null && (
                            <>
                                <Button type='submit' variant='contained' color='secondary' sx={{ width: '100%', height: { xs: 'auto' } }}>
                                    ลงชื่อ WFH
                                </Button>
                                <Button
                                    variant='contained'
                                    color='warning'
                                    sx={{ width: '100%', height: { xs: 'auto' } }}
                                    onClick={handleOpen}
                                >
                                    check-in
                                </Button>
                            </>
                        )}
                        {userCheckinToday && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2, marginTop: 2 }}>
                                {/* <Box>
                                    เวลาเข้างาน: {dayjs(`${userCheckinToday.date} ${userCheckinToday.time}`).format('DD-MM-YYYY HH:mm')}
                                </Box> */}
                                <Box
                                    sx={(theme) => ({
                                        padding: '2px 4px',
                                        borderRadius: 1,
                                        color: theme.palette.success.contrastText,
                                        backgroundColor: Number(userCheckinToday.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                                    })}
                                >
                                    สถานะ: {Number(userCheckinToday.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

function AmountBox({ remaining, total, label }: { remaining: number; total: number; label: string }) {
    return (
        <Stack justifyContent={'center'}>
            <Box display={'flex'} alignItems={'baseline'} justifyContent={'center'} gap={0.5}>
                <Typography variant='h3'>{remaining}</Typography>
                <Typography sx={(theme) => ({ color: theme.palette.primary.light })}>/{total}</Typography>
            </Box>
            <Box sx={(theme) => ({ color: theme.palette.primary.light })}>{label}</Box>
        </Stack>
    );
}
function RemainingAmountOfLeave() {
    return (
        <MenuBox flex={'auto'} minHeight={`${50 * 2}px`}>
            <Stack direction={'row'} width={'100%'} spacing={1} justifyContent={'space-around'}>
                <AmountBox remaining={6} total={7} label='ลาป่วย' />
                <AmountBox remaining={6} total={7} label='ลากิจ' />
                <AmountBox remaining={6} total={7} label='ลาพักร้อน' />
            </Stack>
        </MenuBox>
    );
}

function CheckinHistory({ desktopSize, data, dateSelect }: { desktopSize: boolean; data: CheckinDataExtend; dateSelect: string }) {
    const arr = Object.values(data);
    const f = arr.find((r) => r?.date === dateSelect);
    const status = f ? STATUS[f.statusCode] : null;
    // console.log('arr:', arr);
    //    {status && !outsideCurrentMonth && (
    //             <StatusBox
    //                 label={status.label}
    //                 color={status.color}
    //                 bgc={status.bgc}
    //                 showBackground={desktopSize}
    //                 showLabel={desktopSize}
    //             />
    //         )}
    return (
        <Stack>
            {f && (
                <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                    <Box>
                        <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                            {dayjs(f.date).format('LL')}
                        </Typography>
                        {f.time && <Typography>เข้า: {f.time}</Typography>}
                    </Box>
                    <Box
                        sx={{
                            color: status?.color,
                            bgcolor: status?.bgc,
                            padding: '6px 12px',
                            borderRadius: '6px',
                        }}
                    >
                        {status?.label}
                    </Box>
                </MenuBox>
            )}
            {desktopSize && (
                <>
                    <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                </>
            )}
        </Stack>
    );
}

function MenuList({ desktopSize }: { desktopSize: boolean }) {
    return (
        <Box>
            {desktopSize && <TodayCheckIn />}
            <Stack spacing={1} direction={{ xs: 'column', lg: 'column-reverse' }}>
                <Grid container spacing={1}>
                    <Grid size={{ xs: 8, lg: 6 }} display={'flex'}>
                        <RemainingAmountOfLeave />
                    </Grid>
                    <Grid size={{ xs: 4, lg: 6 }}>
                        <Stack spacing={1} direction={{ xs: 'column', lg: 'row' }} height={'100%'}>
                            <LeaveRequestMenuBox />
                            <SettingsMenuBox />
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
}

function MenuBox({ children, sx, ...props }: { children: React.ReactNode } & BoxProps) {
    return (
        <Box
            {...props}
            sx={[
                {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 0 10px 5px #a0a0a03a',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    padding: '12px',
                },
                (theme) => ({ ...(typeof sx === 'function' ? sx(theme) : sx) }),
            ]}
        >
            {children}
        </Box>
    );
}

function StatusBox({
    label,
    color,
    bgc,
    showBackground = false,
    showLabel = true,
}: {
    label: string;
    color: string;
    bgc: string;
    showBackground?: boolean;
    showLabel?: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.8,
                bgcolor: showBackground ? bgc : 'transparent',
                padding: '1px 6px',
                borderRadius: '16px',
            }}
        >
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: color,
                }}
            />
            {showLabel && <Typography>{label}</Typography>}
        </Box>
    );
}

// New component for "เขียนใบลา"
function LeaveRequestMenuBox() {
    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: '50px',
                flex: 'auto',
                width: { xs: '100%', lg: '50%' },
                bgcolor: '#FF5252',
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
            })}
        >
            <Typography>เขียนใบลา</Typography>
            <MailOutlineIcon />
        </MenuBox>
    );
}

// New component for "ตั้งค่า"
function SettingsMenuBox() {
    return (
        <MenuBox
            sx={(theme) => ({
                minHeight: '50px',
                flex: 'auto',
                width: { xs: '100%', lg: '50%' },
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                justifyContent: 'center',
                gap: '6px',
            })}
        >
            <Typography>ตั้งค่า</Typography>
            <SettingsOutlinedIcon />
        </MenuBox>
    );
}
function CustomCalendarHeader(props: PickersCalendarHeaderProps) {
    const { currentMonth, onMonthChange } = props;

    const handlePrevMonth = () => {
        onMonthChange(dayjs(currentMonth.subtract(1, 'month'), 'left'));
    };

    const handleNextMonth = () => {
        onMonthChange(dayjs(currentMonth.add(1, 'month'), 'right'));
    };

    return (
        <Box display='flex' alignItems='center' justifyContent='space-between' sx={{ px: 1, py: 1 }}>
            {/* Prev button (left) */}
            <IconButton sx={{ borderRadius: '100%', backgroundColor: '#e2e2e293' }} onClick={handlePrevMonth}>
                <ArrowBackIosNewRounded sx={{ fontSize: '12px' }} />
            </IconButton>

            {/* Month & Year (center) */}
            <Typography variant='h5' fontWeight={600} sx={(theme) => ({ color: { xs: theme.palette.primary.contrastText, lg: '#000' } })}>
                {currentMonth.format('MMMM YYYY')}
            </Typography>

            {/* Next button (right) */}
            <IconButton sx={{ borderRadius: '100%', backgroundColor: '#e2e2e293' }} onClick={handleNextMonth}>
                <ArrowForwardIosRounded sx={{ fontSize: '12px' }} />
            </IconButton>
        </Box>
    );
}

function CustomDay({
    day,
    outsideCurrentMonth,
    dataList,
    desktopSize,
    ...props
}: PickersDayProps & { dataList: CheckinDataExtend; desktopSize?: boolean }) {
    const key = day.format('YYYY-MM-DD');
    const data = dataList[key];
    const status = data?.statusCode ? STATUS[data.statusCode] : null;

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 'calc(100% / 7)',
                paddingBottom: { xs: '12px', md: '24px' },
                // border: '1px solid #ccc',
            })}
        >
            <PickersDay
                {...props}
                sx={(theme) => ({ fontSize: theme.typography.body1.fontSize })}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
            />
            {status && !outsideCurrentMonth && (
                <StatusBox
                    label={status.label}
                    color={status.color}
                    bgc={status.bgc}
                    showBackground={desktopSize}
                    showLabel={desktopSize}
                />
            )}
        </Box>
    );
}
export default HomeLanding;

// New component for AppBar
function HomeAppBar() {
    const { authLoading, isSignedIn, profile, signInWithGoogle, signOutUser } = useFirebase();
    return (
        <AppBar
            position='relative'
            sx={{
                height: '75px',
                bgcolor: 'var(--main-accent)',
                boxShadow: '0 1px 10px #000000ce',
                // bgcolor: 'transparent',
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 60,
                        width: '100%',
                    }}
                >
                    <Box display={'flex'} alignItems={'center'} gap={2}>
                        <Box borderRadius={'100%'} overflow={'hidden'}>
                            <CardMedia
                                component='img'
                                sx={{ width: 50 }}
                                image={`${process.env.PUBLIC_URL}/images/logo/projectsoft-logo.png`}
                                alt='logo'
                            />
                        </Box>
                        <Box>
                            <Typography variant='h5'>Projectsoft Check-In</Typography>
                        </Box>
                    </Box>

                    <Box alignItems={'center'} sx={{ display: 'flex', gap: 1 }}>
                        {authLoading ? (
                            'Loading...'
                        ) : (
                            <>
                                {isSignedIn ? (
                                    <>
                                        {/* <Avatar />
                                        <Typography>{profile?.fullName}</Typography> */}
                                        <Button variant='contained' color='error' onClick={signOutUser}>
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant='contained' color='secondary' onClick={signInWithGoogle}>
                                            Signin with google
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
