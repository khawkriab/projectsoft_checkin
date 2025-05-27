// src/components/UserList.tsx
import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db, signInWithGoogleGapi } from 'components/common/firebase/firebaseInitialize';
import { UserCheckInData } from 'type.global';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import useLocation from 'hooks/useLocation';
import { deviceDetect } from 'react-device-detect';
import { Box, Button } from '@mui/material';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const UserList: React.FC = () => {
    const { profile } = useGoogleLogin();
    const { getLocation } = useLocation();
    //
    const [users, setUsers] = useState<UserCheckInData[]>([]);
    const [loading, setLoading] = useState(true);
    //
    const getCheckinTime = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'checkinTime'));
            const usersData: UserCheckInData[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as UserCheckInData),
            }));
            setUsers(usersData);
            console.log('usersData:', usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };
    const onCheckinToday = async () => {
        console.log('profile:', profile);
        if (!profile?.token) return;

        const now = dayjs().utc().valueOf();
        const { lat, lng } = await getLocation(true);
        const payload: UserCheckInData = {
            googleId: profile?.googleId,
            name: profile?.name,
            time: String(now),
            remark: '',
            reason: '',
            device: deviceDetect(undefined),
            latlng: { lat, lng },
            status: 99,
        };
        try {
            await signInWithGoogleGapi(profile.token);
            await addDoc(collection(db, 'checkinTime'), payload);
            getCheckinTime();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    };

    useEffect(() => {
        getCheckinTime();
    }, []);

    if (loading) return <p>Loading...xx</p>;

    return (
        <Box>
            <Box>
                <Button variant='contained' color='error' onClick={() => onCheckinToday()}>
                    check-in
                </Button>
            </Box>
            <ul>
                {users.map((user) => (
                    <li key={user.googleId}>
                        {user.googleId} - {dayjs(Number(user.time)).format('DD-MM-YYYY HH:mm')}
                    </li>
                ))}
            </ul>
        </Box>
    );
};

export default UserList;
