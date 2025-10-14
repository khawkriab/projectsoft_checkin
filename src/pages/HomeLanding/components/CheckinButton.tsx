import { Box, Button, Typography } from '@mui/material';
import { useUserCalendarContext } from 'context/UserCalendarProvider';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { OnCheckinType } from './TodayCheckIn';

export function CheckinButton({
    isSending,
    isMapsLoaded,
    onCheckin,
    onOpenModalOutsideArea,
    onOpenModalMapsCheckin,
}: {
    isSending: boolean;
    isMapsLoaded: boolean;
    onCheckin: OnCheckinType;
    onOpenModalOutsideArea: () => void;
    onOpenModalMapsCheckin: () => void;
}) {
    const { calendarConfig, calendarDateList } = useUserCalendarContext();
    //
    const todayConfig = useMemo(() => {
        const d = calendarConfig.find((f) => f.date === dayjs().format('YYYY-MM-DD'));

        return {
            isWorkDay: !!d && !d?.isHoliDay,
            isWFH: d?.isWFH,
        };
    }, [calendarConfig.length]);

    const userCheckinToday = useMemo(() => {
        if (calendarDateList.length <= 0) return null;

        const d = calendarDateList.find((f) => f.date === dayjs().format('YYYY-MM-DD'));

        return d?.checkinData;
    }, [JSON.stringify(calendarDateList)]);

    //
    if (todayConfig.isWorkDay)
        return (
            <>
                {userCheckinToday === null && (
                    <>
                        {todayConfig.isWFH ? (
                            <Button
                                loading={isSending}
                                variant='contained'
                                color='warning'
                                sx={{ height: 'calc(50% - 4px)' }}
                                onClick={() => onCheckin(true, 'WFH')}
                            >
                                check-in WFH
                            </Button>
                        ) : (
                            <Button
                                variant='contained'
                                color='warning'
                                sx={{ height: 'calc(50% - 4px)' }}
                                onClick={onOpenModalMapsCheckin}
                                disabled={!isMapsLoaded}
                            >
                                check-in
                            </Button>
                        )}
                        <Button variant='contained' color='secondary' sx={{ height: 'calc(50% - 4px)' }} onClick={onOpenModalOutsideArea}>
                            ทำงานนอกสถานที่
                        </Button>
                    </>
                )}
                {userCheckinToday && (
                    <>
                        <Box
                            sx={(theme) => ({
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                padding: '2px',
                                borderRadius: 1,
                                color: theme.palette.success.contrastText,
                                backgroundColor: Number(userCheckinToday.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                            })}
                        >
                            <Typography>สถานะ: {Number(userCheckinToday.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}</Typography>
                            <Typography>เวลาเข้างาน:</Typography>
                            <Typography>{dayjs(`${userCheckinToday.date} ${userCheckinToday.time}`).format('DD-MM-YYYY HH:mm')}</Typography>
                        </Box>
                    </>
                )}
            </>
        );

    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                padding: '2px 12px',
                borderRadius: 1,
                color: theme.palette.success.contrastText,
                backgroundColor: '#909090',
            })}
        >
            หยุด
        </Box>
    );
}
