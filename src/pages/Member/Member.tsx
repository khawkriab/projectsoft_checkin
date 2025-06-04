import { Box, Button, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { addUsersList, getUsersList, getUsersRegisterList } from 'components/common/firebase/firebaseApi/checkinApi';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { TableBodyCell, TableHeadCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { Profile } from 'type.global';

type MemberType = Profile;

function Member() {
    const { profile } = useGoogleLogin();
    const [memberList, setMemberList] = useState<MemberType[]>([]);
    //

    const onApprove = async (user: MemberType) => {
        if (!profile?.token) return;

        await addUsersList(profile.token, user);

        getUserList();
    };
    const getUserList = async () => {
        // const arr = await getUserList();
        // setMemberList([...arr]);
        const res = await getUsersList();
        const usersData: MemberType[] = res.map((doc) => ({
            ...doc,
        }));

        setMemberList([...usersData]);

        // if (profile?.role === 'ADMIN') {
        //     const queryRegist = await getUsersRegisterList();
        //     const usersRegist: MemberType[] = queryRegist.map((doc) => ({
        //         ...doc,
        //         status: 'WAITING',
        //     }));

        //     setMemberList((prev) => [...prev, ...usersRegist]);
        // }
    };
    useEffect(() => {
        if (profile) getUserList();
    }, [JSON.stringify(profile)]);

    const dataList = useMemo(() => {
        return memberList.filter((f) => f.email);
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
                            {profile?.role === 'ADMIN' && (
                                <>
                                    <TableHeadCell>allowFindLocation</TableHeadCell>
                                    <TableHeadCell>Register Status</TableHeadCell>
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataList.map((u) => (
                            <TableRow key={u.email}>
                                <TableBodyCell>{u.fullName}</TableBodyCell>
                                <TableBodyCell>{u.name}</TableBodyCell>
                                <TableBodyCell>{u.email}</TableBodyCell>
                                <TableBodyCell>{u.phoneNumber}</TableBodyCell>
                                <TableBodyCell>{u.jobPosition}</TableBodyCell>
                                <TableBodyCell>{u.employmentType}</TableBodyCell>
                                <TableBodyCell>{u.role}</TableBodyCell>
                                {profile?.role === 'ADMIN' && (
                                    <>
                                        <TableBodyCell>{u.allowFindLocation}</TableBodyCell>
                                        <TableBodyCell>
                                            {u.status === 'APPROVE' ? (
                                                <Button size='small' variant='contained' color='success'>
                                                    Registered
                                                </Button>
                                            ) : u.status === 'WAITING' ? (
                                                <Button size='small' variant='contained' color='warning' onClick={() => onApprove(u)}>
                                                    Approve
                                                </Button>
                                            ) : (
                                                <Button size='small' variant='contained' color='error'>
                                                    No Regiester
                                                </Button>
                                            )}
                                        </TableBodyCell>
                                    </>
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
