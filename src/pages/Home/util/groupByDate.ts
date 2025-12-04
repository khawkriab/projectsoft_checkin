import { CalendarDateConfig, CalendarDateList, CheckinDate } from 'type.global';

// Utility function to group array by date
export function groupByDate(userCheckInDate: CheckinDate[], dateConfig: CalendarDateConfig[]) {
    const grouped: Record<string, CheckinDate[]> = {};

    userCheckInDate.forEach((data) => {
        if (!grouped[data.date]) grouped[data.date] = [];
        grouped[data.date].push(data);
    });

    const arr: CalendarDateList[] = dateConfig.map((cfg) => ({
        ...cfg,
        userCheckinList: grouped[cfg.date] ?? [],
    }));

    // convert for old data structure
    // const arr = dateConfig.map((cfg) => ({
    //     ...cfg,
    //     id: cfg.date,
    //     wfhFlag: cfg.isWorkOutside ? 1 : 0,

    //     userCheckinList: grouped[cfg.date] ?? [],
    // }));

    return arr;
}
