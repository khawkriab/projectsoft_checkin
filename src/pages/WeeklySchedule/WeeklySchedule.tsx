import { Box } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { useState } from 'react';

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
    const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
    const [value, setValue] = useState<Dayjs | null>(dayjs('2022-04-17'));

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
            <Box width={'50%'}></Box>
        </Box>
    );
}

export default WeeklySchedule;
