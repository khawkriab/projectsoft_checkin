import { Box, Grid } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getCalendarConfig, getSystemAreaConfig, getUserWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { useFirebase } from 'context/FirebaseProvider';
import { CheckinDate } from 'type.global';
import HomeAppBar from './components/HomeAppBar';
import { TodayCheckIn } from './components/TodayCheckIn';
import CalendarCheckin from './components/CalendarCheckin';
import { CheckinHistory } from './components/CheckinHistory';
import { MenuList } from './components/MenuList';

export type StatusCode = keyof typeof STATUS;

export type CheckinDataExtend = Record<string, (CheckinDate & { statusCode: StatusCode }) | null>;

export const STATUS = {
    // TODAY: { code: 'TODAY', label: 'วันนี้', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    NORMAL: { code: 'NORMAL', label: 'ปกติ', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    LATE: { code: 'LATE', label: 'สาย', color: 'var(--status-late-color)', bgc: 'var(--status-late-bgc)' },
    LEAVE: { code: 'LEAVE', label: 'ลา', color: 'var(--status-leave-color)', bgc: 'var(--status-leave-bgc)' },
    HOLIDAY: { code: 'HOLIDAY', label: 'วันหยุด', color: 'var(--status-holiday-color)', bgc: 'var(--status-holiday-bgc)' },
    ABSENT: { code: 'ABSENT', label: 'ขาด', color: 'var(--status-miss-color)', bgc: 'var(--status-miss-bgc)' },
} as const;

function HomeLanding() {
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
                const isBeforeDay = dayjs(data.date).isBefore(dayjs().add(-1, 'day'));
                const startWork = dayjs(profile.employmentStartDate).isAfter(data.date);

                if (dayjs(data.date).isAfter(dayjs())) return;

                if (!grouped[data.date]) grouped[data.date] = null;

                if (td) {
                    let statusCode: StatusCode = 'NORMAL';
                    if (td && dayjs(`${td.date} ${td.time}`).isAfter(dayjs(`${data.date} ${data.entryTime}`))) statusCode = 'LATE';

                    if (td.absentId) statusCode = 'LEAVE';

                    grouped[data.date] = { ...td, statusCode: statusCode };
                } else if (isBeforeDay && !startWork) {
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
                    backgroundColor: theme.palette.background.default,
                    // backgroundImage: 'url(images/four_circles_no_overlap.svg)',
                    // backgroundRepeat: 'no-repeat',
                    // backgroundSize: { xs: 'cover' },
                    // filter: 'blur(5px)',
                },
            })}
        >
            <HomeAppBar />
            <Box className='body-content' padding={{ xs: '12px', sm: '24px' }}>
                {/* date */}
                <Box display={{ xs: 'block', lg: 'none' }}>
                    <TodayCheckIn />
                </Box>
                <Grid container spacing={2} direction={{ xs: 'column', lg: 'row' }}>
                    {/* calendar */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <CalendarCheckin checkInCalendar={checkInCalendar} dateSelect={dateSelect} setDateSelect={setDateSelect} />
                        <CheckinHistory dateSelect={dateSelect} data={checkInCalendar} />
                    </Grid>
                    {/* menu */}
                    <Grid size={{ xs: 12, lg: 6 }}>
                        <MenuList />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default HomeLanding;
