import {
    Alert,
    Box,
    Button,
    Paper,
    Slide,
    Snackbar,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import { updateUser, getUsersList } from 'context/FirebaseProvider/firebaseApi/userApi';
import { TableBodyCell, TableHeadCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { Profile, ProfileStatus } from 'type.global';

type MemberType = Profile;

function Member() {
    const { profile } = useFirebase();
    const [memberList, setMemberList] = useState<MemberType[]>([]);
    //
    const [updating, setUpdating] = useState(false);
    const [open, setOpen] = useState(false);
    //

    // const onApprove = async (user: MemberType) => {
    //     if (!user.id) return;
    //     setUpdating(true);
    //     await updateUser(user.id, { ...user, status: 'APPROVE' });
    //     setOpen(true);
    //     getUserList();
    // };
    const onChangeStatus = async (user: MemberType, status: ProfileStatus) => {
        if (!user.id) return;
        setUpdating(true);
        await updateUser(user.id, { ...user, status: status });
        setOpen(true);
        getUserList();
    };

    const onChangeRole = async (role: MemberType['role'], user: MemberType) => {
        if (!user.id) return;

        try {
            const status = user.status === 'INACTIVE' ? 'APPROVE' : user.status;
            setUpdating(true);
            await updateUser(user.id, { ...user, role: role, status: status });
            setOpen(true);
            getUserList();
        } catch (error) {
            console.error('error:', error);
        }
    };

    const getUserList = async () => {
        const res = await getUsersList();
        setMemberList([...res]);

        setUpdating(false);
    };
    useEffect(() => {
        if (profile) getUserList();
    }, [JSON.stringify(profile)]);

    const dataList = useMemo(() => {
        return memberList.filter((f) => f.email);
    }, [JSON.stringify(memberList)]);

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
                                <TableBodyCell>
                                    {profile?.role === 'ADMIN' ? (
                                        <ToggleButtonGroup
                                            disabled={updating}
                                            color='error'
                                            exclusive
                                            value={u.status === 'INACTIVE' ? 'INACTIVE' : u.role}
                                            onChange={(_, value) => {
                                                if (value === 'INACTIVE') {
                                                    onChangeStatus(u, 'INACTIVE');
                                                } else {
                                                    onChangeRole(value as MemberType['role'], u);
                                                }
                                            }}
                                        >
                                            <ToggleButton value='ADMIN'>Admin</ToggleButton>
                                            <ToggleButton value='STAFF'>Staff</ToggleButton>
                                            <ToggleButton value='USER'>User</ToggleButton>
                                            <ToggleButton value='INACTIVE'>Inactive User</ToggleButton>
                                        </ToggleButtonGroup>
                                    ) : (
                                        u.role
                                    )}
                                </TableBodyCell>
                                {profile?.role === 'ADMIN' && (
                                    <>
                                        <TableBodyCell>{u.allowFindLocation}</TableBodyCell>
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
                                                    onClick={() => onChangeStatus(u, 'APPROVE')}
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
