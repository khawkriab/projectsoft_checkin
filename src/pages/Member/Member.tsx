import { Alert, Box, Button, Paper, Slide, Snackbar, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { addUsersList, getUsersList, getUsersRegisterList } from 'components/common/firebase/firebaseApi/checkinApi';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { TableBodyCell, TableHeadCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { Profile } from 'type.global';
import { userList } from './userList';

type MemberType = Profile;

function Member() {
    const { profile } = useGoogleLogin();
    const [memberList, setMemberList] = useState<MemberType[]>([]);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    //

    const onApprove = async (user: MemberType) => {
        // if (!profile?.token) return;

        setUpdating(true);
        await addUsersList('', user);
        setOpen(true);
        getUserList();
    };
    const onAddUser = async (user: any) => {
        setUpdating(true);
        await addUsersList('', user);

        // getUserList();
        setUpdating(false);
        setOpen(true);
    };
    const getUserList = async () => {
        // const arr = await getUserList();
        // setMemberList([...arr]);
        const res = await getUsersList();
        // const usersData: MemberType[] = res.map((doc) => ({
        //     ...doc,
        // }));

        // setMemberList([...usersData]);
        setMemberList([...res]);
        // console.log('usersData:', usersData);

        // if (profile?.role === 'ADMIN') {
        //     const queryRegist = await getUsersRegisterList();
        //     const usersRegist: MemberType[] = queryRegist.map((doc) => ({
        //         ...doc,
        //         status: 'WAITING',
        //     }));

        //     setMemberList((prev) => [...prev, ...usersRegist]);
        // }
        setUpdating(false);
    };
    useEffect(() => {
        if (profile) getUserList();
    }, [JSON.stringify(profile)]);

    const dataList = useMemo(() => {
        return memberList.filter((f) => f.email);
    }, [memberList.toString()]);

    return (
        <Box>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                slots={{ transition: Slide }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity='success' variant='filled' sx={{ width: '100%' }}>
                    updated successfully
                </Alert>
            </Snackbar>
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
                                        {/* <TableBodyCell>
                                            <Button
                                                size='small'
                                                variant='contained'
                                                color='success'
                                                loading={updating}
                                                onClick={() => onAddUser(u)}
                                            >
                                                add user
                                            </Button>
                                        </TableBodyCell> */}
                                        <TableBodyCell>
                                            {u.status === 'APPROVE' ? (
                                                <Button size='small' variant='contained' color='success'>
                                                    Registered
                                                </Button>
                                            ) : u.status === 'WAITING' ? (
                                                <Button
                                                    loading={updating}
                                                    size='small'
                                                    variant='contained'
                                                    color='warning'
                                                    onClick={() => onApprove(u)}
                                                >
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
