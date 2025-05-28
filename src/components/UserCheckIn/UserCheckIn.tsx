import { Alert, Box, Button, Grid, Slide, Snackbar, TextField } from '@mui/material';
import { addUserCheckinToday, getCheckinToday } from 'components/common/firebase/firebaseApi/checkinApi';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import dayjs from 'dayjs';
import useLocation from 'hooks/useLocation';
import { useEffect, useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { UserCheckInData } from 'type.global';

function UserCheckIn() {
    const { profile } = useGoogleLogin();
    const { lat, lng } = useLocation();
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [currentUserData, setCurrentUserData] = useState<UserCheckInData | null | undefined>(undefined);
    //
    const onCheckin = async (remark?: string) => {
        if (profile?.token) {
            const now = dayjs().utc().valueOf();

            setUpdating(true);

            const payload: UserCheckInData = {
                googleId: profile?.googleId,
                name: profile?.name,
                time: String(now),
                remark: remark ?? '',
                reason: reason,
                device: deviceDetect(undefined),
                latlng: { lat, lng },
                status: 99,
            };
            await addUserCheckinToday(profile.token, payload);
            await getUserCheckinToday();
            setOpen(true);

            setUpdating(false);
        }
    };

    const onCheckinWFH = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin('WFH');
    };

    const getUserCheckinToday = async () => {
        try {
            const res = await getCheckinToday(profile?.googleId ?? '');

            setCurrentUserData({ ...res });
        } catch (error) {
            console.error('error:', error);
            setCurrentUserData(null);
        }
    };

    useEffect(() => {
        getUserCheckinToday();
    }, []);
    //
    return (
        <>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Sheet updated successfully
                </Alert>
            </Snackbar>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                {currentUserData && profile?.role === 'USER' && (
                    <>
                        <Box>เวลาเข้างาน: {dayjs(Number(currentUserData.time)).format('DD-MM-YYYY HH:mm')}</Box>
                        <Box
                            sx={(theme) => ({
                                padding: '2px 4px',
                                borderRadius: 1,
                                color: theme.palette.success.contrastText,
                                backgroundColor: Number(currentUserData.status) === 99 ? '#ff6f00' : theme.palette.success.main,
                            })}
                        >
                            สถานะ: {Number(currentUserData.status) === 99 ? 'รอ' : 'อนุมัติแล้ว'}
                        </Box>
                    </>
                )}
                {currentUserData === null && (
                    <Grid container gap={2} alignItems={'center'} sx={{ width: '100%' }}>
                        <Grid size={{ xs: 12, sm: 12, md: 7 }}>
                            <Box component={'form'} onSubmit={onCheckinWFH}>
                                <Grid container alignItems={'center'} gap={2} sx={{ width: '100%' }}>
                                    <Grid size={{ xs: 12, sm: 'grow' }}>
                                        <TextField
                                            fullWidth
                                            required
                                            label='เหตุผลที่ work from home หรือ มาสาย'
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid flex={'none'}>
                                        <Button
                                            type='submit'
                                            disabled={!!currentUserData}
                                            loading={updating}
                                            variant='outlined'
                                            color='primary'
                                        >
                                            ลงชื่อเข้างาน WFH
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                        <Grid flex={'auto'}>
                            <Button
                                disabled={!!currentUserData}
                                loading={updating}
                                variant='contained'
                                color='error'
                                onClick={() => onCheckin()}
                            >
                                ลงชื่อเข้างาน
                            </Button>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </>
    );
}

export default UserCheckIn;
