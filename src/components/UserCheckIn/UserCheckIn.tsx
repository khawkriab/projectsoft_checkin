import { Alert, Box, Button, Grid, Slide, Snackbar, TextField } from '@mui/material';
import axios from 'axios';
import { useGoogleLogin } from 'components/GoogleLoginProvider';
import dayjs from 'dayjs';
import useLocation from 'hooks/useLocation';
import { useEffect, useState } from 'react';
import { deviceDetect } from 'react-device-detect';
import { UserCheckInData } from 'type.global';

type UserCheckInProps = {
    getCheckin: () => Promise<UserCheckInData[]>;
};

function UserCheckIn({ getCheckin }: UserCheckInProps) {
    const { profile, auth2, authLoading, isSignedIn } = useGoogleLogin();
    const { lat, lng } = useLocation();
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [currentUserData, setCurrentUserData] = useState<UserCheckInData | null | undefined>(undefined);
    //
    const onCheckin = async (remark?: string) => {
        if (auth2) {
            const user = auth2.currentUser.get();
            const token = user.getAuthResponse().access_token;
            const sheetsId = '1fMqyQw-JCm6ykyOgnfP--CtldfxAG27BNaegLjcrNK4';
            const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`;

            const now = dayjs().utc().valueOf();

            const c = await getCheckin();
            let rowNumber = c.length + 2; // add 2 because have header and data current

            // find row no data
            if (c.length > 1) {
                const findIndexOf = c.findIndex((f) => !f.id);
                if (findIndexOf >= 0) {
                    rowNumber = findIndexOf + 1;
                }
            }

            const requestBody = {
                valueInputOption: 'USER_ENTERED', // or "RAW"
                data: [
                    {
                        range: `Today!A${rowNumber}`,
                        values: [[user.getId()]],
                    },
                    {
                        range: `Today!B${rowNumber}`,
                        values: [[`${now}`]],
                    },
                    {
                        range: `Today!C${rowNumber}`,
                        values: [[remark ?? '']],
                    },
                    {
                        range: `Today!D${rowNumber}`,
                        values: [[reason]],
                    },
                    {
                        range: `Today!E${rowNumber}`,
                        values: [[JSON.stringify(deviceDetect(undefined))]],
                    },
                    {
                        range: `Today!F${rowNumber}`,
                        values: [[`[${lat},${lng}]`]],
                    },
                    {
                        range: `Today!G${rowNumber}`,
                        values: [['99']],
                    },
                ],
            };

            setUpdating(true);
            const response = await axios(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(requestBody),
            });

            if (response.status === 200) {
                await getCurrentData();
                setOpen(true);
            } else {
                alert('Error updating the sheet');
            }
            setUpdating(false);
        }
    };

    const onCheckinWFH = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCheckin('WFH');
    };

    const getCurrentData = async () => {
        const res = await getCheckin();
        const findData = res.find((f) => f.id === profile?.id);

        if (findData) {
            setCurrentUserData({ ...findData });
        } else {
            setCurrentUserData(null);
        }
    };

    useEffect(() => {
        getCurrentData();
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
                                backgroundColor: currentUserData.status === '99' ? '#ff6f00' : theme.palette.success.main,
                            })}
                        >
                            สถานะ: {currentUserData.status === '99' ? 'รอ' : 'อนุมัติแล้ว'}
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
