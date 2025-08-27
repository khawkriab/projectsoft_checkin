import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

type UseDateTimeReturn = {
    date: string;
    time: string;
};

export function useDateTime(dateFormat: string = 'YYYY-MM-DD', timeFormat: string = 'HH:mm:ss'): UseDateTimeReturn {
    const [dateTime, setDateTime] = useState<UseDateTimeReturn>(() => ({
        date: dayjs().format(dateFormat),
        time: dayjs().format(timeFormat),
    }));

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime({
                date: dayjs().format(dateFormat),
                time: dayjs().format(timeFormat),
            });
        }, 1000); // update every second

        return () => clearInterval(interval);
    }, [dateFormat, timeFormat]);

    return dateTime;
}
