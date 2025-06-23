import { Box, Button } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { useEffect, useState } from 'react';
import { createScheduleWeekly, getScheduleWeekly } from 'components/common/FirebaseProvider/firebaseApi/schedulesApi';
import { useFirebase } from 'components/common/FirebaseProvider';
import { useNotification } from 'components/common/NotificationCenter';

dayjs.extend(isBetweenPlugin);

interface CustomPickerDayProps extends PickersDayProps {
    isSelected: boolean;
    isHovered: boolean;
}

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})<CustomPickerDayProps>(({ theme, isSelected, isHovered, day }) => ({
    borderRadius: 0,
    ...(isSelected && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.main,
        },
    }),
    ...(isHovered && {
        backgroundColor: theme.palette.primary.light,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.light,
        },
        ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.primary.dark,
            '&:hover, &:focus': {
                backgroundColor: theme.palette.primary.dark,
            },
        }),
    }),
    ...(day.day() === 0 && {
        borderTopLeftRadius: '18px',
        borderBottomLeftRadius: '18px',
    }),
    ...(day.day() === 6 && {
        borderTopRightRadius: '18px',
        borderBottomRightRadius: '18px',
    }),
})) as React.ComponentType<CustomPickerDayProps>;

const isInSameWeek = (dayA: Dayjs, dayB: Dayjs | null | undefined) => {
    if (dayB == null) {
        return false;
    }

    return dayA.isSame(dayB, 'week');
};

function Day(
    props: PickersDayProps & {
        selectedDay?: Dayjs | null;
        hoveredDay?: Dayjs | null;
    }
) {
    const { day, selectedDay, hoveredDay, ...other } = props;

    return (
        <CustomPickersDay
            {...other}
            day={day}
            selected={false}
            isSelected={isInSameWeek(day, selectedDay)}
            isHovered={isInSameWeek(day, hoveredDay)}
        />
    );
}

function WeeklySchedule() {
    const { profile } = useFirebase();
    const { openNotify } = useNotification();
    const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
    const [value, setValue] = useState<Dayjs | null>(dayjs());
    const [loading, setLoading] = useState(false);

    const onAddSchedule = async () => {
        if (!value || !profile) return;

        setLoading(true);
        try {
            const startOfWeek = value.startOf('week');
            const endOfWeek = value.endOf('week');
            // DD-MM_DD-MM-YYYY
            await createScheduleWeekly(`${startOfWeek.format('DD-MM')}_${endOfWeek.format('DD-MM-YYYY')}`, {
                startDate: startOfWeek.format('YYYY-MM-DD'),
                endDate: endOfWeek.format('YYYY-MM-DD'),
                userList: [
                    {
                        name: profile?.name,
                        email: profile?.email,
                        googleId: profile?.googleId,
                    },
                ],
            });

            openNotify('success', 'add success');
        } catch (error) {
            openNotify('error', '!!! error');
            console.error('error:', error);
        }

        setLoading(false);
    };

    useEffect(() => {
        console.log('value:', value);
        console.log('startOf:', value?.startOf('week'));
        console.log('endOf:', value?.endOf('week'));

        const init = async () => {
            const now = dayjs();
            const startDate = now.startOf('month').startOf('week').format('YYYY-MM-DD');
            console.log('startDate:', startDate);
            const endDate = now.endOf('month').endOf('week').format('YYYY-MM-DD');
            console.log('endDate:', endDate);
            try {
                const res = await getScheduleWeekly(startDate, endDate);
                console.log('res:', res);
            } catch (error) {
                console.log('error:', error);
            }
        };

        init();
    }, [value]);

    return (
        <Box>
            <Box width={'50%'}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                        value={value}
                        onChange={(newValue) => setValue(newValue)}
                        showDaysOutsideCurrentMonth
                        // displayWeekNumber
                        slots={{ day: Day }}
                        slotProps={{
                            day: (ownerState) =>
                                ({
                                    selectedDay: value,
                                    hoveredDay,
                                    onPointerEnter: () => setHoveredDay(ownerState.day),
                                    onPointerLeave: () => setHoveredDay(null),
                                } as any),
                        }}
                        sx={(theme) => ({
                            '&.MuiDateCalendar-root': {
                                width: 'auto',
                                maxHeight: '100%',
                            },

                            '.MuiDayCalendar-weekDayLabel': {
                                backgroundColor: theme.palette.mode === 'light' ? '#eeeeee' : '#ffffff17',
                            },
                            '.MuiDayCalendar-weekDayLabel, .MuiPickersDay-root': {
                                width: '14%',
                                borderRight: '1px solid #cccccc',
                                margin: 0,

                                '&:last-of-type': {
                                    borderRight: 'unset',
                                },
                            },
                        })}
                    />
                </LocalizationProvider>
            </Box>
            <Box width={'50%'}>
                <Button loading={loading} variant='contained' color='primary' onClick={onAddSchedule}>
                    add
                </Button>
            </Box>
        </Box>
    );
}

export default WeeklySchedule;
