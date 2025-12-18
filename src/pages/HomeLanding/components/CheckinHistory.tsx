import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { MenuBox } from './Menu/MenuBox';
import dayjs from 'dayjs';
import { StatusBox } from './Menu/StatusBox';
import { UserCalendarCheckin, useUserCalendarContext } from 'context/UserCalendarProvider';
import { getLeaveLabel } from 'helper/leaveType';

function HistoryCard({ data }: { data: UserCalendarCheckin }) {
    return (
        <MenuBox minHeight={`${50 * 2}px`} marginTop={'12px'}>
            <Box>
                <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                    {dayjs(data.date).format('LL')}
                </Typography>
                <Box pl={'6px'}>
                    {data.checkinData?.time && <Typography>เข้า: {data.checkinData?.time}</Typography>}
                    {data.remark && <Typography>{data.remark}</Typography>}
                    {data.checkinData?.absentId && data.checkinData.leaveType && data.checkinData.leavePeriod && (
                        <Typography>
                            {getLeaveLabel(data.checkinData.leaveType, data.checkinData.leavePeriod)}: {data.checkinData.reason}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box>
                {data?.checkinData?.status !== 99 && data?.checkinData?.statusCode && (
                    <StatusBox status={data.checkinData.statusCode} showBackground />
                )}
                {data?.checkinData?.status === 99 && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: '#ff6f00',
                            padding: '1px 6px',
                            borderRadius: '16px',
                            color: '#fff',
                        }}
                    >
                        รออนุมัติ
                    </Box>
                )}
                {data.isHoliDay && <StatusBox status={'HOLIDAY'} showBackground />}
            </Box>
        </MenuBox>
    );
}

export function CheckinHistory() {
    const { dateSelect, calendarDateList } = useUserCalendarContext();
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    // const arr = Object.values(data);
    const f = calendarDateList.find((r) => r?.date === dateSelect);

    return (
        <Stack sx={{ mt: { xs: 0, lg: '12px' } }}>
            {f && <HistoryCard data={f} />}
            {desktopSize &&
                calendarDateList
                    .filter((fl) => !!fl.checkinData)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => <HistoryCard key={m.date} data={m} />)}
        </Stack>
    );
}
