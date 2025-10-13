import { Badge, Box, Button, Checkbox, FormControlLabel, FormGroup, Switch, TextField, ToggleButton, Typography } from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay, PickersDayProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useEffect, useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
    getCalendarConfig,
    getSystemWeeklyWorkingDaysConfig,
    getSystemWorkTimesConfig,
    updateCalendarConfig,
} from 'context/FirebaseProvider/firebaseApi/checkinApi';
import { CalendarDateConfig, CheckinCalendar, Profile, ProfileRole, UserCheckinList, WeeklyWorkingDays, WorkTimes } from 'type.global';
import { useNotification } from 'components/common/NotificationCenter';
import { useFirebase } from 'context/FirebaseProvider';

dayjs.extend(customParseFormat);

function DayCustom({
    calendarDateConfig,
    weeklyWorkingDays,
    onChangeConfig,
    day,
    outsideCurrentMonth,
    ...props
}: PickersDayProps & {
    calendarDateConfig: CalendarDateConfig[];
    weeklyWorkingDays: WeeklyWorkingDays;
    onChangeConfig: (event: React.ChangeEvent<HTMLInputElement>, day: dayjs.Dayjs) => void;
}) {
    const findDate = calendarDateConfig.find((f) => f.date === day.format('YYYY-MM-DD'));
    const isSelected = !outsideCurrentMonth && !!findDate && !findDate.isHoliDay && !findDate.isWFH;
    const weekDay = day.format('dddd') as keyof WeeklyWorkingDays;

    return (
        <Box
            sx={(theme) => ({
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: 'calc(100% / 7)',
                padding: '6px',
                border: '1px solid #ccc',
            })}
        >
            <PickersDay sx={{ fontSize: '16px', fontWeight: 600 }} {...props} outsideCurrentMonth={outsideCurrentMonth} day={day} />
            {/* <Box>{isSelected ? <CheckCircleIcon color='success' /> : undefined}</Box> */}
            {!outsideCurrentMonth && weeklyWorkingDays[weekDay] && (
                <Box>
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch size='small' checked={isSelected} name='workDay' onChange={(e) => onChangeConfig(e, day)} />}
                            label='Work Day'
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    size='small'
                                    color='warning'
                                    name='isWFH'
                                    checked={findDate?.isWFH}
                                    onChange={(e) => onChangeConfig(e, day)}
                                />
                            }
                            label='WFH Day'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    size='small'
                                    color='success'
                                    name='isHoliDay'
                                    checked={findDate?.isHoliDay}
                                    onChange={(e) => onChangeConfig(e, day)}
                                />
                            }
                            label='Holiday'
                        />
                    </FormGroup>
                </Box>
            )}
        </Box>
    );
}

function CreateMonthCalendar() {
    const { profile } = useFirebase();
    //
    const { openNotify } = useNotification();
    const [updating, setUpdating] = useState(false);
    const [month, setMonth] = useState(dayjs().get('months')); // 0-11
    const [years, setYears] = useState(dayjs().get('years'));
    const [calendarDateConfig, setCalendarDateConfig] = useState<CalendarDateConfig[]>([]);
    const [workTimes, setWorkTimes] = useState<WorkTimes | null>(null); // HH:mm
    const [weeklyWorkingDays, setWeeklyWorkingDays] = useState<WeeklyWorkingDays>({
        Friday: false,
        Monday: false,
        Saturday: false,
        Sunday: false,
        Thursday: false,
        Tuesday: false,
        Wednesday: false,
    });
    //

    const onUpdateCalendar = async () => {
        if (!workTimes?.entryTime) return;

        setUpdating(true);
        await updateCalendarConfig({
            id: `${years}-${month + 1}`,
            data: calendarDateConfig.map((d) => ({ ...d, entryTime: workTimes.entryTime })),
        });
        setUpdating(false);
        openNotify('success', 'update seccess');
    };

    // ** month: 0-11
    const getCalendar = async (year: number, month: number) => {
        // new way
        const res = await getCalendarConfig({ id: `${year}-${month + 1}` });
        setCalendarDateConfig([...res]);
    };
    useEffect(() => {
        getCalendar(years, month);
    }, [month, years]);

    useEffect(() => {
        const init = async () => {
            const wwd = await getSystemWeeklyWorkingDaysConfig();
            const wt = await getSystemWorkTimesConfig();
            setWorkTimes(wt);
            setWeeklyWorkingDays((prev) => ({ ...prev, ...wwd }));
        };

        init();
    }, []);

    //
    return (
        <Box>
            <Box>
                <Typography>Work Times: {`${workTimes?.entryTime} - ${workTimes?.exitTime}`}</Typography>
            </Box>
            <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'} gap={1}>
                <Typography>Weekly Working Days: </Typography>
                <FormControlLabel label={'Sunday'} control={<Checkbox disabled checked={weeklyWorkingDays['Sunday']} />} />{' '}
                <FormControlLabel label={'Monday'} control={<Checkbox disabled checked={weeklyWorkingDays['Monday']} />} />
                <FormControlLabel label={'Tuesday'} control={<Checkbox disabled checked={weeklyWorkingDays['Tuesday']} />} />{' '}
                <FormControlLabel label={'Wednesday'} control={<Checkbox disabled checked={weeklyWorkingDays['Wednesday']} />} />
                <FormControlLabel label={'Thursday'} control={<Checkbox disabled checked={weeklyWorkingDays['Thursday']} />} />
                <FormControlLabel label={'Friday'} control={<Checkbox disabled checked={weeklyWorkingDays['Friday']} />} />{' '}
                <FormControlLabel label={'Saturday'} control={<Checkbox disabled checked={weeklyWorkingDays['Saturday']} />} />
            </Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    // fixedWeekNumber={6}
                    // sx={{
                    //     '& .MuiPickersDay-root.Mui-selected, & .MuiPickersDay-root.Mui-selected:hover, , & .MuiPickersDay-root.Mui-selected:focus':
                    //         {
                    //             color: 'inherit',
                    //             backgroundColor: 'inherit',
                    //         },
                    //     '&.MuiDateCalendar-root': {
                    //         width: '90vw',
                    //         height: '68vh',
                    //         maxHeight: 'unset',
                    //     },
                    //     '& .MuiPickersSlideTransition-root': {
                    //         height: '60vh',
                    //     },
                    //     '& .MuiPickersDay-root, .MuiDayCalendar-weekDayLabel': {
                    //         fontSize: '1.25rem',
                    //         width: 'calc(90vw / 7)',
                    //         height: 'calc(60vh / 7)',
                    //         borderRadius: 0,
                    //         margin: 0,
                    //         opacity: 1,
                    //         border: '1px solid #ccc',
                    //     },
                    //     '& .MuiDayCalendar-weekContainer': {
                    //         margin: 0,
                    //     },
                    //     '& .MuiDayCalendar-weekDayLabel': {
                    //         backgroundColor: '#777',
                    //     },
                    // }}
                    sx={(theme) => ({
                        '.MuiDayCalendar-root': {
                            // boxShadow: { xs: '0 0 10px 10px #bababa3b', lg: 'none' },
                            // boxShadow: { xs: theme.palette.mode === 'light' ? '0 0 5px 2px #a0a0a03a' : 'none', lg: 'none' },
                            // border: { xs: '2px solid #bababa3b', lg: 'none' },
                            backgroundColor: 'transparent',
                            // borderRadius: '12px',
                            overflow: 'hidden',
                            marginTop: '12px',
                            // padding: '12px',
                        },
                        '&.MuiDateCalendar-root': {
                            width: '100%',
                            height: 'auto',
                            maxHeight: 'unset',
                            overflow: 'visible',

                            '.MuiDayCalendar-monthContainer': {
                                position: 'relative',
                            },
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
                            color: theme.palette.text.primary,
                            fontSize: theme.typography.h6.fontSize,
                            border: '1px solid #ccc',
                            margin: 0,
                        },
                    })}
                    slots={{
                        day: (dayProps) => (
                            <DayCustom
                                {...dayProps}
                                calendarDateConfig={calendarDateConfig}
                                weeklyWorkingDays={weeklyWorkingDays}
                                onChangeConfig={(e, day) => {
                                    let n = [...calendarDateConfig];
                                    const parseDay = day.format('YYYY-MM-DD');
                                    const index = n.findIndex((f) => f.date === parseDay);

                                    // if has data, has one of isHoliDay or isWFH or object
                                    if (index >= 0) {
                                        const value = n[index];
                                        // if not isHoliDay and isWFH and workDay is false, remove array
                                        if (e.target.name === 'workDay' && !e.target.checked && !value.isHoliDay && !value.isWFH) {
                                            n.splice(index, 1);

                                            // if not workDay, but checked, reset all and update new value
                                        } else if (e.target.name !== 'workDay' && e.target.checked) {
                                            n[index] = {
                                                ...n[index],
                                                isWFH: false,
                                                isHoliDay: false,
                                                [e.target.name]: e.target.checked,
                                            };

                                            // if workDay is checked, reset all to false
                                        } else if (e.target.name === 'workDay' && e.target.checked) {
                                            n[index] = {
                                                ...n[index],
                                                isWFH: false,
                                                isHoliDay: false,
                                            };

                                            // all is false, remove array
                                        } else {
                                            n.splice(index, 1);
                                        }
                                    } else if (e.target.checked) {
                                        n.push({
                                            date: parseDay,
                                            isWFH: false,
                                            isHoliDay: false,
                                            entryTime: '',
                                            exitTime: '',
                                            remark: '',
                                            ...(e.target.name !== 'workDay' && { [e.target.name]: e.target.checked }),
                                        });
                                    }

                                    setCalendarDateConfig([...n]);
                                }}
                            />
                        ),
                    }}
                    shouldDisableDate={(day) => {
                        // const date = day.date();
                        // const hasData = currentFromDatabase.filter((f) => f.userCheckinList.length > 0);
                        // return day.isBefore(dayjs(), 'day');
                        return false;
                    }}
                    onMonthChange={(m) => {
                        setMonth(m.get('months'));
                        setYears(m.get('years'));
                    }}
                />
            </LocalizationProvider>
            {profile?.role === 'ADMIN' && (
                <Box display={'flex'} justifyContent={'flex-end'} width={'100%'} margin={'auto'} pr={'12px'}>
                    {/* {calendarDateConfig[3]?.isHoliDay && (
                        <TextField
                            size='small'
                            label={'remark'}
                            placeholder='หยุดเพราะอะไร'
                            name='remark'
                            value={calendarDateConfig[3].remark || ''}
                            onChange={(e) =>
                                setCalendarDateConfig((prev) => {
                                    let n = [...prev];
                                    n[3] = { ...n[3], remark: e.target.value };

                                    return n;
                                })
                            }
                        />
                    )} */}
                    <Button variant='contained' color='primary' onClick={onUpdateCalendar} loading={updating}>
                        Update
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default CreateMonthCalendar;
