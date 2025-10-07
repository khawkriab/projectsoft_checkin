import { ArrowBack, ArrowForward, ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import { AppBar, Box, BoxProps, Button, CardMedia, Grid, IconButton, Stack, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersCalendarHeaderProps, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DateTime from 'components/common/DateTime/DateTime';
import dayjs, { Dayjs } from 'dayjs';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

type StatusCode = keyof typeof STATUS;

export const STATUS = {
    // TODAY: { code: 'TODAY', label: 'วันนี้', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    NORMAL: { code: 'NORMAL', label: 'ปกติ', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    LATE: { code: 'LATE', label: 'สาย', color: 'var(--status-late-color)', bgc: 'var(--status-late-bgc)' },
    LEAVE: { code: 'LEAVE', label: 'ลา', color: 'var(--status-leave-color)', bgc: 'var(--status-leave-bgc)' },
    HOLIDAY: { code: 'HOLIDAY', label: 'วันหยุด', color: 'var(--status-holiday-color)', bgc: 'var(--status-holiday-bgc)' },
} as const;

const dataList: Record<string, StatusCode> = {
    [dayjs().format('YYYY-MM-DD')]: 'NORMAL',
    '2025-09-18': 'NORMAL',
    '2025-09-19': 'LATE',
    '2025-09-10': 'LEAVE',
    '2025-09-11': 'HOLIDAY',
};

function HomeLanding() {
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    console.log('desktopSize:', desktopSize);
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
                <Grid container spacing={2} direction={{ xs: 'column', lg: 'row-reverse' }}>
                    {/* calendar */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Box
                            sx={{
                                boxShadow: { xs: 'none', lg: '0 0 10px 10px #bababa3b' },
                                backgroundColor: { xs: 'transparent', lg: '#ffffff' },
                                overflow: { xs: 'visible', lg: 'hidden' },
                                borderRadius: '12px',
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
                                        day: (dayProps) => <CustomDay dataList={dataList} desktopSize={desktopSize} {...dayProps} />,
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
                                    // onChange={(newValue) => {
                                    //     const date = newValue?.get('date') ?? 0;
                                    //     if (date && profile?.role === 'ADMIN') {
                                    //         let n = [...datesSelected];
                                    //         const index = n.findIndex((f) => f.date === date);

                                    //         if (index >= 0) {
                                    //             n.splice(index, 1);
                                    //         } else {
                                    //             n.push({ date: date, wfhFlag: false, userCheckinList: [] });
                                    //         }

                                    //         setDatesSelected([...n]);
                                    //     }
                                    // }}
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

function TodayCheckIn() {
    return (
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
                        background: { xs: 'transparent', lg: 'linear-gradient(to right, #3572EF,#47D7EB)' },
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
            <Grid display={'flex'} alignItems={'center'} size={{ xs: 'auto', lg: 3 }}>
                <Button variant='contained' color='warning' sx={{ width: '100%', height: { xs: 'auto', lg: '100%' } }}>
                    check-in
                </Button>
            </Grid>
        </Grid>
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

function CheckinHistory({ desktopSize }: { desktopSize: boolean }) {
    return (
        <Stack>
            <MenuBox minHeight={`${50 * 2}px`} marginBottom={'12px'}>
                <Box>
                    <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                        12 สิงหาคม 2567
                    </Typography>
                    <Typography>เข้า: --:-- ออก: --:--</Typography>
                </Box>
                <Box
                    sx={{
                        color: 'var(--status-holiday-color)',
                        bgcolor: 'var(--status-holiday-bgc)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                    }}
                >
                    วันหยุด
                </Box>
            </MenuBox>
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
                <CheckinHistory desktopSize={desktopSize} />
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
                    boxShadow: '0 0 10px 5px #bababa3b',
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
            <Typography variant='h5' fontWeight={600}>
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
}: PickersDayProps & { dataList: Record<string, StatusCode>; desktopSize?: boolean }) {
    const key = day.format('YYYY-MM-DD');
    const statusCode = dataList[key];
    const status = statusCode ? STATUS[statusCode] : null;

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
                    <Box>login</Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
