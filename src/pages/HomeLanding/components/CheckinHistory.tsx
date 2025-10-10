import { Box, Stack, Typography, useMediaQuery } from '@mui/material';
import { MenuBox } from './MenuBox';
import { CheckinDataExtend, STATUS } from '../HomeLanding';
import dayjs from 'dayjs';

export function CheckinHistory({ data, dateSelect }: { data: CheckinDataExtend; dateSelect: string }) {
    const desktopSize = useMediaQuery((t) => t.breakpoints.up('lg'));
    const arr = Object.values(data);
    const f = arr.find((r) => r?.date === dateSelect);
    const status = f ? STATUS[f.statusCode] : null;

    return (
        <Stack sx={{ mt: { xs: 0, lg: '12px' } }}>
            {f && f.status !== 99 && (
                <MenuBox minHeight={`${50 * 2}px`}>
                    <Box>
                        <Typography variant='h6' sx={(theme) => ({ color: theme.palette.primary.light, fontWeight: 500 })}>
                            {dayjs(f.date).format('LL')}
                        </Typography>
                        {f.time && <Typography>เข้า: {f.time}</Typography>}
                    </Box>
                    <Box
                        sx={{
                            color: status?.color,
                            bgcolor: status?.bgc,
                            padding: '6px 12px',
                            borderRadius: '6px',
                        }}
                    >
                        {status?.label}
                    </Box>
                </MenuBox>
            )}
            {desktopSize && (
                <>
                    <MenuBox minHeight={`${50 * 2}px`} marginTop={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginTop={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginTop={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                    <MenuBox minHeight={`${50 * 2}px`} marginTop={'12px'}>
                        <div>12 สิงหาคม 2567</div>
                        <div>หยุดวันแม่ วันหยุด</div>
                    </MenuBox>
                </>
            )}
        </Stack>
    );
}
