import { LeaveData } from 'type.global';

function getDateDiff(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive days
}

export function summarizeUserLeave(list: LeaveData[]) {
    const periodValue = {
        HALF_DAY_AM: 0.5,
        HALF_DAY_PM: 0.5,
        FULL_DAY: 1,
    } as const;

    return list.reduce(
        (acc, item) => {
            let leaveDays = 0;

            if (item.startDate === item.endDate) {
                // single day leave → use leavePeriod
                leaveDays = periodValue[item.leavePeriod];
            } else {
                // multi-day leave → calculate days
                const days = getDateDiff(item.startDate, item.endDate);
                leaveDays = days * 1; // assume each day is FULL_DAY
            }

            if (item.leaveType === 'PERSONAL') {
                acc.personal += leaveDays;
            } else if (item.leaveType === 'SICK') {
                acc.sick += leaveDays;
            } else if (item.leaveType === 'VACATION') {
                acc.vacation += leaveDays;
            }

            return acc;
        },
        {
            personal: 0,
            sick: 0,
            vacation: 0,
        }
    );
}
