import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { db, signInWithGoogleGapi } from 'components/common/firebase/firebaseInitialize';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { TableBodyCell, TableHeadCell } from 'components/common/MuiTable';
import { addDoc, collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Profile } from 'type.global';

type MemberType = Profile & { status?: 'WAITING' | 'APPROVE'; id: string };

function Member() {
    const { profile } = useGoogleLogin();
    const [memberList, setMemberList] = useState<MemberType[]>([]);
    //
    const onApprove = async (user: MemberType) => {
        if (!profile?.token) return;

        await signInWithGoogleGapi(profile.token);
        await addDoc(collection(db, 'usersList'), {
            googleId: user.googleId,
            fullName: user.fullName,
            profileURL: user.profileURL,
            email: user.email,
            role: user.role,
            name: user.name,
            phoneNumber: user.phoneNumber,
            jobPosition: user.jobPosition,
            employmentType: user.employmentType,
        });
        await deleteDoc(doc(db, 'usersRegister', user.id));
        getUserList();
    };
    const getUserList = async () => {
        // const arr = await getUserList();
        // setMemberList([...arr]);
        const querySnapshot = await getDocs(collection(db, 'usersList'));
        const usersData: MemberType[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as MemberType),
            id: doc.id,
            status: 'APPROVE',
        }));

        setMemberList([...usersData]);

        if (profile?.role === 'ADMIN') {
            const queryRegist = await getDocs(collection(db, 'usersRegister'));
            const usersRegist: MemberType[] = queryRegist.docs.map((doc) => ({
                ...(doc.data() as MemberType),
                status: 'WAITING',
                id: doc.id,
            }));

            setMemberList((prev) => [...prev, ...usersRegist]);
        }
    };
    useEffect(() => {
        if (profile) getUserList();
    }, [JSON.stringify(profile)]);

    const dataList = useMemo(() => {
        return memberList.filter((f) => f.googleId);
    }, [memberList.toString()]);

    return (
        <Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow
                            sx={(theme) => ({
                                backgroundColor: theme.palette.primary.dark,
                            })}
                        >
                            <TableHeadCell>Full Name</TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Email</TableHeadCell>
                            <TableHeadCell>Phone Number</TableHeadCell>
                            <TableHeadCell>Job Position</TableHeadCell>
                            <TableHeadCell>Employee Type</TableHeadCell>
                            <TableHeadCell>Role</TableHeadCell>
                            {profile?.role === 'ADMIN' && <TableHeadCell>Register Status</TableHeadCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataList.map((u) => (
                            <TableRow key={u.googleId}>
                                <TableBodyCell>{u.fullName}</TableBodyCell>
                                <TableBodyCell>{u.name}</TableBodyCell>
                                <TableBodyCell>{u.email}</TableBodyCell>
                                <TableBodyCell>{u.phoneNumber}</TableBodyCell>
                                <TableBodyCell>{u.jobPosition}</TableBodyCell>
                                <TableBodyCell>{u.employmentType}</TableBodyCell>
                                <TableBodyCell>{u.role}</TableBodyCell>
                                {profile?.role === 'ADMIN' && (
                                    <TableBodyCell>
                                        {u.status === 'APPROVE' ? (
                                            <Button size='small' variant='contained' color='success'>
                                                Registered
                                            </Button>
                                        ) : (
                                            <Button size='small' variant='contained' color='warning' onClick={() => onApprove(u)}>
                                                Approve
                                            </Button>
                                        )}
                                    </TableBodyCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Member;
