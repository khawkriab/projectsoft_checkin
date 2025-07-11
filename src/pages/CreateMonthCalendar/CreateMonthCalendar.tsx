import { Badge, Box, Button, ToggleButton } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
    createCalendarMonthOfYears,
    deleteCalendarMonthOfYears,
    getCalendarMonthOfYears,
    updateCalendarMonthOfYears,
} from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { CheckinCalendar, Profile, ProfileRole, UserCheckinList } from 'type.global';
import { useNotification } from 'components/common/NotificationCenter';
import { useFirebase } from 'components/common/FirebaseProvider';

dayjs.extend(customParseFormat);

type DateSelected = {
    date: number; // 1-31
    wfhFlag: boolean;
    userCheckinList: UserCheckinList[];
};

function ServerDay(
    props: PickersDayProps & { role?: ProfileRole; datesSelected: DateSelected[]; onAddMarkWFH: (date: number, wfhFlag: boolean) => void }
) {
    const { role, datesSelected = [], day, outsideCurrentMonth, onAddMarkWFH, ...other } = props;

    const findDate = datesSelected.find((f) => f.date === props.day.date());
    const isSelected = !props.outsideCurrentMonth && !!findDate;

    return (
        <Badge
            key={props.day.toString()}
            overlap='circular'
            sx={{
                '& .MuiBadge-badge': {
                    transform: 'none',
                    right: 'auto',
                    left: 0,
                    top: '10px',
                },
            }}
            badgeContent={
                <>
                    {isSelected ? <CheckCircleIcon color='success' /> : undefined}
                    {(isSelected && role === 'ADMIN') || findDate?.wfhFlag ? (
                        <ToggleButton
                            size='small'
                            value='check'
                            selected={findDate.wfhFlag}
                            color='primary'
                            sx={{ borderRadius: 6, padding: '0px 4px', fontSize: '12px', marginLeft: 1 }}
                            onChange={() => onAddMarkWFH(findDate.date, !findDate.wfhFlag)}
                        >
                            mark WFH {findDate.wfhFlag && <CheckCircleIcon color='success' sx={{ fontSize: '16px' }} />}
                        </ToggleButton>
                    ) : undefined}
                </>
            }
        >
            <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

function CreateMonthCalendar() {
    const { profile } = useFirebase();
    //
    const { openNotify } = useNotification();
    const [allDays, setAllDays] = useState<CheckinCalendar[]>([]);
    const [updating, setUpdating] = useState(false);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    const [years, setYears] = useState(dayjs().get('years'));
    const [datesSelected, setDatesSelected] = useState<DateSelected[]>([]);
    const [currentFromDatabase, setCurrentFromDatabase] = useState<DateSelected[]>([]);
    //

    const onUpdateCalendar = async () => {
        // Extract dates
        const oldDates = currentFromDatabase.map((item) => item.date);
        const newDates = datesSelected.map((item) => item.date);

        // Find added and removed dates
        const added = datesSelected.filter((item) => !oldDates.includes(item.date));
        const removed = currentFromDatabase.filter((item) => !newDates.includes(item.date));

        const m = [...added, ...currentFromDatabase].map((d) => ({
            year: years,
            month: month,
            date: d.date,
            wfhFlag: d.wfhFlag ? 1 : 0,
            userCheckinList: d.userCheckinList,
        }));

        setUpdating(true);
        await createCalendarMonthOfYears(m);
        await deleteCalendarMonthOfYears(removed.map((m) => ({ year: years, month: month, date: m.date })));
        await getCalendar(years, month);
        setUpdating(false);
        openNotify('success', 'update seccess');
    };
    const onTranfer = async (data: CheckinCalendar) => {
        console.log('data:', data);
        const date = dayjs(data.date);
        const day = date.get('date'); // 1-31
        const findFromDatabase = currentFromDatabase.find((f) => f.date === day);

        if (findFromDatabase) {
            await updateCalendarMonthOfYears({
                year: date.get('years'),
                month: date.get('month'),
                date: day,
                wfhFlag: findFromDatabase.wfhFlag ? 1 : 0,
                userCheckinList: data.userCheckinList,
            });
            await getCalendar(date.get('years'), date.get('month'));
            openNotify('success', 'update seccess');
        }
    };
    // const onUpdateCalendar = async () => {
    //     const selectMonth = dayjs().set('months', month).set('years', years).format('YYYY-MM');
    //     const n = highlightedDays.sort((a, b) => a - b);
    //     const m = n.map((d) => ({ date: `${selectMonth}-${d}`, userCheckinList: [] }));

    //     await createCheckinCalendar(m as any);
    //     alert('success');
    // };

    // ** month: 0-11
    const getCalendar = async (year: number, month: number) => {
        const res = await getCalendarMonthOfYears({
            year: year,
            month: month,
        });
        // console.log('res:', res);
        // const res1 = await getCheckinCalendar();
        // setAllDays([...res1.filter((f) => f.userCheckinList.length > 0)]);
        // console.log('res1:', res1);
        // setHighlightedDays([...res.map((d) => dayjs(d.date).get('date'))]);
        const mapData = res.map((d) => ({ date: dayjs(d.date).get('date'), wfhFlag: !!d.wfhFlag, userCheckinList: d.userCheckinList }));
        setDatesSelected([...mapData]);
        setCurrentFromDatabase([...mapData]);
    };
    useEffect(() => {
        getCalendar(years, month);
    }, [month, years]);

    //
    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    fixedWeekNumber={6}
                    sx={{
                        '& .MuiPickersDay-root.Mui-selected, & .MuiPickersDay-root.Mui-selected:hover, , & .MuiPickersDay-root.Mui-selected:focus':
                            {
                                color: 'inherit',
                                backgroundColor: 'inherit',
                            },
                        '&.MuiDateCalendar-root': {
                            width: '90vw',
                            height: '68vh',
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
                        day: (dayProps) => (
                            <ServerDay
                                {...dayProps}
                                role={profile?.role}
                                datesSelected={datesSelected}
                                onAddMarkWFH={(date: number, wfhFlag: boolean) => {
                                    if (profile?.role === 'ADMIN') {
                                        let n = [...datesSelected];
                                        const indexOfDate = n.findIndex((f) => f.date === date);

                                        if (indexOfDate >= 0) {
                                            n[indexOfDate].wfhFlag = wfhFlag;
                                        }

                                        setDatesSelected([...n]);
                                    }
                                }}
                            />
                        ),
                    }}
                    shouldDisableDate={(day) => {
                        const date = day.date();
                        const hasData = currentFromDatabase.filter((f) => f.userCheckinList.length > 0);
                        return hasData.map((m) => m.date).includes(date);
                    }}
                    onMonthChange={(m) => {
                        setMonth(m.get('months'));
                        setYears(m.get('years'));
                    }}
                    onChange={(newValue) => {
                        const date = newValue?.get('date') ?? 0;
                        if (date && profile?.role === 'ADMIN') {
                            let n = [...datesSelected];
                            const index = n.findIndex((f) => f.date === date);

                            if (index >= 0) {
                                n.splice(index, 1);
                            } else {
                                n.push({ date: date, wfhFlag: false, userCheckinList: [] });
                            }

                            setDatesSelected([...n]);
                        }
                    }}
                />
            </LocalizationProvider>
            {profile?.role === 'ADMIN' && (
                <Box display={'flex'} justifyContent={'flex-end'} width={'90vw'} margin={'auto'}>
                    <Button variant='contained' color='primary' onClick={onUpdateCalendar} loading={updating}>
                        Update
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default CreateMonthCalendar;
