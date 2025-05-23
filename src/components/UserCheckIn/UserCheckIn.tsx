import { Alert, Box, Button, Slide, Snackbar } from '@mui/material';
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
    const [currentUserData, setCurrentUserData] = useState<UserCheckInData | null>(null);
    //
    const onCheckin = async () => {
        if (auth2) {
            const user = auth2.currentUser.get();
            const token = user.getAuthResponse().access_token;
            const sheetsId = '1fMqyQw-JCm6ykyOgnfP--CtldfxAG27BNaegLjcrNK4';
            const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`;

            const now = dayjs().utc().valueOf();

            const c = await getCheckin();
            const rowNumber = c.length + 2;
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
                        values: [[`[${lat},${lng}]`]],
                    },
                    {
                        range: `Today!E${rowNumber}`,
                        values: [[JSON.stringify(deviceDetect(undefined))]],
                    },
                    {
                        range: `Today!F${rowNumber}`,
                        values: [['latlng']],
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

    const getCurrentData = async () => {
        const res = await getCheckin();
        const findData = res.find((f) => f.id === profile?.id);

        if (findData) {
            setCurrentUserData({ ...findData });
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
                <Button disabled={!!currentUserData} loading={updating} variant='contained' color='error' onClick={onCheckin}>
                    ลงชื่อเข้างาน
                </Button>
            </Box>
        </>
    );
}

export default UserCheckIn;
