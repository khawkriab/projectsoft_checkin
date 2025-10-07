import { Box, Button, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableContainer, TableRow } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { useEffect, useMemo, useState } from 'react';
import { createScheduleWeekly, getScheduleWeekly } from 'context/FirebaseProvider/firebaseApi/schedulesApi';
import { useFirebase } from 'context/FirebaseProvider';
import { useNotification } from 'components/common/NotificationCenter';
import { TableBodyCell } from 'components/common/MuiTable';
import { BaseData, FirebaseQuery, Profile, WeeklyScheduleData } from 'type.global';
import { getUsersList } from 'context/FirebaseProvider/firebaseApi/userApi';

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
    //
    const [hoveredDay, setHoveredDay] = useState<Dayjs | null>(null);
    const [value, setValue] = useState<Dayjs | null>(dayjs());
    const [loading, setLoading] = useState(false);
    const [weeklyScheduleList, setWeeklyScheduleList] = useState<(FirebaseQuery & WeeklyScheduleData)[]>([]);
    const [profileData, setProfileData] = useState<Pick<Profile, 'email' | 'googleId' | 'name'> | null>(null);
    const [userList, setUserList] = useState<Profile[]>([]);
    //

    const onAddSchedule = async () => {
        if (!value || !profileData) return;

        setLoading(true);
        try {
            const startOfWeek = value.startOf('week');
            const endOfWeek = value.endOf('week');
            // DD-MM_DD-MM-YYYY
            await createScheduleWeekly(`${startOfWeek.format('DD-MM')}_${endOfWeek.format('DD-MM-YYYY')}`, {
                startDate: startOfWeek.format('YYYY-MM-DD'),
                endDate: endOfWeek.format('YYYY-MM-DD'),
                userList: [
                    ...(weeklyInfo?.userList ?? []),
                    {
                        name: profileData?.name,
                        email: profileData?.email,
                        googleId: profileData?.googleId,
                    },
                ],
            });

            const cs = value?.startOf('month').startOf('week');
            const ce = value?.endOf('month').endOf('week');
            await getScheduleWeeklyData(cs.format('YYYY-MM-DD'), ce.format('YYYY-MM-DD'));

            openNotify('success', 'add success');
        } catch (error) {
            openNotify('error', '!!! error');
            console.error('error:', error);
        }

        setLoading(false);
    };

    const weeklyInfo = useMemo(() => {
        const currentDate = value?.startOf('week').format('YYYY-MM-DD');
        const findData = weeklyScheduleList.find((f) => f.startDate === currentDate);

        return findData;
    }, [value, JSON.stringify(weeklyScheduleList)]);

    const getScheduleWeeklyData = async (startDate: string, endDate: string) => {
        try {
            const res = await getScheduleWeekly(startDate, endDate);
            setWeeklyScheduleList([...res]);
        } catch (error) {
            console.log('error:', error);
        }
    };

    const getUserList = async () => {
        try {
            const res = await getUsersList();
            const u = res.filter((f) => f.status !== 'INACTIVE' && f.jobPosition !== 'CEO');

            setUserList([...u]);
        } catch (error) {
            console.error('error:', error);
        }
    };

    useEffect(() => {
        const getScheduleWithMonth = () => {
            const cs = value?.startOf('week').startOf('month');
            const ce = value?.endOf('week').endOf('month');

            if (cs && ce) {
                getScheduleWeeklyData(cs.format('YYYY-MM-DD'), ce.format('YYYY-MM-DD'));
            }
        };

        getScheduleWithMonth();
    }, [value?.startOf('week')?.startOf('month')?.get('month'), value?.endOf('week')?.endOf('month')?.get('month')]);

    useEffect(() => {
        const init = () => {
            if (profile) {
                setProfileData({
                    name: profile?.name,
                    email: profile?.email,
                    googleId: profile?.googleId,
                });
            }

            if (profile?.role === 'ADMIN') {
                getUserList();
            }
        };

        init();
    }, [JSON.stringify(profile)]);

    return (
        <Box>
            <Box display={'flex'} flexWrap={'wrap'}>
                <Box width={{ xs: '100%', md: '50%' }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                            value={value}
                            onChange={(newValue) => setValue(newValue)}
                            showDaysOutsideCurrentMonth
                            minDate={dayjs().startOf('month')}
                            maxDate={dayjs().add(3, 'month').endOf('month')}
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
                <Box width={{ xs: '100%', md: '50%' }} padding={3} display={'flex'} flexDirection={'column'}>
                    <Box>
                        <Box>รายละเอียด</Box>
                        {weeklyInfo && (
                            <TableContainer>
                                <Table>
                                    <TableBody>
                                        {weeklyInfo.userList.map((u) => (
                                            <TableRow key={`${weeklyInfo.id}-${weeklyInfo.startDate}-${u.googleId}`}>
                                                <TableBodyCell>{u.name}</TableBodyCell>
                                                <TableBodyCell>{`${dayjs(weeklyInfo.startDate).format('DD/MM/YYYY')} - ${dayjs(
                                                    weeklyInfo.endDate
                                                ).format('DD/MM/YYYY')}`}</TableBodyCell>
                                                <TableBodyCell align='right'>
                                                    {profile?.googleId === u.googleId &&
                                                        dayjs().isBefore(dayjs(weeklyInfo.startDate).format('DD/MM/YYYY'), 'date') && (
                                                            <Button variant='contained' color='error'>
                                                                ยกเลิก
                                                            </Button>
                                                        )}
                                                </TableBodyCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                    {(!weeklyInfo?.userList || weeklyInfo?.userList?.filter((f) => f.email === profile?.email).length <= 0) && (
                        <Box marginTop={'auto'} marginLeft={'auto'} pt={4} pb={2}>
                            <Box display={'flex'} alignItems={'center'}>
                                ชื่อ:{' '}
                                {profile?.role === 'ADMIN' ? (
                                    <FormControl fullWidth>
                                        <Select
                                            name='email'
                                            value={profileData?.email ?? ''}
                                            onChange={(e) => {
                                                const findData = userList.find((f) => f.email === e.target.value);

                                                if (findData) {
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        email: findData.email,
                                                        googleId: findData.googleId,
                                                        name: findData.name,
                                                    }));
                                                }
                                            }}
                                        >
                                            {userList.map((u) => (
                                                <MenuItem key={u.id} value={u.email}>
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <span>{profile?.name}</span>
                                )}
                            </Box>

                            <Box>
                                รับผิดชอบ: {`${value?.startOf('week').format('DD/MM/YYYY')} - ${value?.endOf('week').format('DD/MM/YYYY')}`}
                            </Box>
                            <Box display={'flex'} justifyContent={'flex-end'} mt={2}>
                                <Button loading={loading} variant='contained' color='error' onClick={onAddSchedule}>
                                    ลงชื่อเปิดห้อง
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default WeeklySchedule;
