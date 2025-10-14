import { useFirebase } from 'context/FirebaseProvider';
import { getCalendarConfig, getUserWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
import dayjs from 'dayjs';
import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarDateConfig, CheckinDate } from 'type.global';

export const STATUS = {
    NORMAL: { code: 'NORMAL', label: 'ตรงเวลา', color: 'var(--status-normal-color)', bgc: 'var(--status-normal-bgc)' },
    LATE: { code: 'LATE', label: 'สาย', color: 'var(--status-late-color)', bgc: 'var(--status-late-bgc)' },
    LEAVE: { code: 'LEAVE', label: 'ลา', color: 'var(--status-leave-color)', bgc: 'var(--status-leave-bgc)' },
    ABSENT: { code: 'ABSENT', label: 'ขาด', color: 'var(--status-miss-color)', bgc: 'var(--status-miss-bgc)' },
    HOLIDAY: { code: 'HOLIDAY', label: 'วันหยุด', color: 'var(--status-holiday-color)', bgc: 'var(--status-holiday-bgc)' },
    WFH_DAY: { code: 'WFH_DAY', label: 'ทำงานที่บ้าน', color: 'var(--status-wfh-day-color)', bgc: 'var(--status-wfh-day-bgc)' },
    WORK_DAY: { code: 'WFH_DAY', label: 'วันทำงาน', color: 'var(--status-work-day-color)', bgc: 'var(--status-work-day-bgc)' },
} as const;

export type StatusCode = keyof typeof STATUS;

export type UserCalendarCheckin = CalendarDateConfig & { checkinData: (CheckinDate & { statusCode: StatusCode }) | null };

export type UserCalendarContextType = {
    calendarConfig: CalendarDateConfig[];
    calendarDateList: UserCalendarCheckin[];
    dateSelect: string;
    onSelectDate: (date: string) => void; // format YYYY-MM-DD
    getUserCheckin: () => Promise<void>;
};

const UserCalendarContext = createContext<UserCalendarContextType>(null!);

function UserCalendarProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useFirebase();
    //
    const [calendarDateList, setalendarDateList] = useState<UserCalendarCheckin[]>([]);
    const [calendarConfig, setCalendarConfig] = useState<CalendarDateConfig[]>([]);
    const [dateSelect, setDateSelect] = useState(dayjs().format('YYYY-MM-DD'));
    //

    const onSelectDate = (date: string) => {
        setDateSelect(date);
    };

    const getUserCheckin = async () => {
        if (!profile?.email) return;

        let c = [...calendarConfig];
        if (calendarConfig.length <= 0) {
            c = await getCalendarConfig({ id: dayjs().format('YYYY-M') });
            setCalendarConfig([...c]);
        }

        const res = await getUserWorkTime({
            startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
            endDate: dayjs().format('YYYY-MM-DD'),
            email: profile?.email,
        });

        if (!res) return;

        const arr: UserCalendarCheckin[] = c.map((data) => {
            let checkinData: UserCalendarCheckin['checkinData'] = null;

            const td = res.find((f) => f.date === data.date);
            const isBeforeDay = dayjs(data.date).isBefore(dayjs().add(-1, 'day'));
            const startWork = dayjs(profile.employmentStartDate).isAfter(data.date);

            if (td) {
                let statusCode: StatusCode = 'NORMAL';
                if (td && dayjs(`${td.date} ${td.time}`).isAfter(dayjs(`${data.date} ${data.entryTime}`))) statusCode = 'LATE';

                if (td.absentId) statusCode = 'LEAVE';

                checkinData = { ...td, statusCode: statusCode };
            } else if (isBeforeDay && !startWork && !data.isHoliDay) {
                checkinData = {
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

            return {
                ...data,
                checkinData: checkinData,
            };
        });

        setalendarDateList([...arr]);
    };
    useEffect(() => {
        getUserCheckin();
    }, [profile?.email]);

    return (
        <UserCalendarContext value={{ calendarConfig, calendarDateList, dateSelect, onSelectDate, getUserCheckin }}>
            {children}
        </UserCalendarContext>
    );
}

function useUserCalendarContext() {
    const context = useContext(UserCalendarContext);

    return context;
}

export { UserCalendarProvider, useUserCalendarContext };
