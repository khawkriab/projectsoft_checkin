import { useDateTime } from './useDateTime';

function DateTime({ show, dateFormat, timeFormat }: { show?: 'date' | 'time'; dateFormat?: string; timeFormat?: string }) {
    const { date, time } = useDateTime(dateFormat, timeFormat);

    if (show === 'date') return <span>{date}</span>;
    if (show === 'time') return <span>{time}</span>;
    return (
        <span>
            {date} {time}
        </span>
    );
}

export default DateTime;
