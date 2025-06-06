import { Badge, Box, Button } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'components/common/FirebaseProvider';
import { createCheckinCalendar, getCheckinCalendar } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';

dayjs.extend(customParseFormat);

function ServerDay(props: PickersDayProps & { highlightedDays?: number[] }) {
    const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

    const isSelected = !props.outsideCurrentMonth && highlightedDays.indexOf(props.day.date()) >= 0;

    return (
        <Badge key={props.day.toString()} overlap='circular' badgeContent={isSelected ? <CheckCircleIcon color='success' /> : undefined}>
            <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

function CreateMonthCalendar() {
    const { profile } = useFirebase();
    //
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
    const [month, setMonth] = useState(dayjs().get('months'));
    const [years, setYears] = useState(dayjs().get('years'));
    //

    const onCreateCalendar = async () => {
        const selectMonth = dayjs().set('months', month).set('years', years).format('YYYY-MM');
        const n = highlightedDays.sort((a, b) => a - b);
        const m = n.map((d) => ({ date: `${selectMonth}-${d}`, userCheckinList: [] }));

        await createCheckinCalendar(m as any);
        alert('success');
    };

    useEffect(() => {
        const init = async () => {
            const res = await getCheckinCalendar();
            setHighlightedDays([...res.map((d) => dayjs(d.date, 'D-MM-YYYY').get('date'))]);
        };
        init();
    }, []);
    //
    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    sx={{
                        '&.MuiDateCalendar-root': {
                            width: '90vw',
                            height: '80vh',
                            maxHeight: 'unset',
                        },
                        '& .MuiPickersSlideTransition-root': {
                            height: '60vh',
                        },
                        '& .MuiPickersDay-root, .MuiDayCalendar-weekDayLabel': {
                            fontSize: '1.25rem',
                            width: 'calc(90vw / 7)',
                            height: 'calc(60vh / 7)',
                            borderRadius: 0,
                            margin: 0,
                            opacity: 1,
                            border: '1px solid #ccc',
                        },
                        '& .MuiDayCalendar-weekContainer': {
                            margin: 0,
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                            backgroundColor: '#777',
                        },
                    }}
                    slots={{
                        day: ServerDay,
                    }}
                    slotProps={{
                        day: {
                            highlightedDays: highlightedDays,
                        } as any,
                    }}
                    onMonthChange={(m) => {
                        setMonth(m.get('months'));
                        setYears(m.get('years'));
                    }}
                    onChange={(newValue) => {
                        const date = newValue?.get('date') ?? 0;
                        if (date) {
                            let n = [...highlightedDays];
                            const index = n.indexOf(date);

                            if (index >= 0) {
                                n.splice(index, 1);
                            } else {
                                n.push(date);
                            }

                            setHighlightedDays([...n]);
                        }
                    }}
                />
            </LocalizationProvider>
            <Box>
                <Button variant='contained' color='primary' onClick={onCreateCalendar}>
                    Create
                </Button>
            </Box>
        </Box>
    );
}

export default CreateMonthCalendar;
