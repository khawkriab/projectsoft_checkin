import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Paper,
    Slide,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import { updateUser, getUsersList } from 'context/FirebaseProvider/firebaseApi/userApi';
import { TableBodyCell, TableHeadCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { Profile, ProfileRole, ProfileStatus } from 'type.global';
import dayjs from 'dayjs';
import CopyBox from 'components/common/CopyBox';

type MemberType = Profile;

function BoxBetween({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box display={'flex'} alignItems={'center'} marginTop={1}>
            <Box>{label}</Box>
            <Box flex={'auto'} display={'flex'} justifyContent={'flex-end'}>
                {children}
            </Box>
        </Box>
    );
}

function CardUser({
    role,
    data,
    onChangeRole,
    onChangeStatus,
}: {
    data: MemberType;
    role?: ProfileRole;
    onChangeRole: (role: MemberType['role'], user: MemberType) => Promise<void>;
    onChangeStatus: (user: MemberType, status: ProfileStatus) => Promise<void>;
}) {
    const bgc = useMemo(() => {
        if (data.jobPosition === 'CEO') return 'linear-gradient(to right, #ef3535 0%, #ebc547 100%)';
        if (data.status === 'INACTIVE') return 'linear-gradient(to right, #000000 0%, #ff6363 100%)';
        return 'linear-gradient(to right, #3572ef 0%, #47d7eb 100%)';
    }, [data.jobPosition, data.status]);

    return (
        <Paper
            sx={{
                position: 'relative',
                padding: '12px',
                backgroundColor: '#ffffff',
                width: '100%',
                maxWidth: '450px',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '20px',
                    right: 0,
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    backgroundImage: bgc,
                }}
            >
                {data.jobPosition}
            </Box>
            <Box width={'60px'} height={'60px'} borderRadius={'100%'} overflow={'hidden'} bgcolor={'#cccccc'}>
                <Box component={'img'} src={data.profileURL || ''} />
            </Box>
            <Box marginTop={3}>
                <Box>{data.name}</Box>
                <Box>
                    <Typography variant='h6'>{data.fullName}</Typography>
                </Box>
            </Box>
            <Box marginTop={3}>
                <Box>
                    <CopyBox text={data.suid}>{data.suid}</CopyBox>
                </Box>
                <BoxBetween label='Email:'>{data.email}</BoxBetween>
                <BoxBetween label='Phone Number:'>{data.phoneNumber}</BoxBetween>
                <BoxBetween label='Employee Type:'>{data.employmentType}</BoxBetween>
                <BoxBetween label='สถานะบัญชี:'>{data.status}</BoxBetween>
                <BoxBetween label='วันเริ่มทำงาน:'>{data.employmentStartDate}</BoxBetween>
                <BoxBetween label='วันสิ้นสุดการทำงาน:'>{data.employmentEndDate}</BoxBetween>
                <BoxBetween label='Role:'>
                    {role === 'ADMIN' ? (
                        <ToggleButtonGroup
                            // disabled={updating}
                            size='small'
                            color='error'
                            exclusive
                            value={data.status === 'INACTIVE' ? 'INACTIVE' : data.role}
                            onChange={(_, value) => {
                                if (value === 'INACTIVE') {
                                    onChangeStatus(data, 'INACTIVE');
                                } else {
                                    onChangeRole(value as MemberType['role'], data);
                                }
                            }}
                        >
                            <ToggleButton value='ADMIN'>Admin</ToggleButton>
                            <ToggleButton value='STAFF'>Staff</ToggleButton>
                            <ToggleButton value='USER'>User</ToggleButton>
                            <ToggleButton value='INACTIVE'>Inactive User</ToggleButton>
                        </ToggleButtonGroup>
                    ) : (
                        data.role
                    )}
                </BoxBetween>
            </Box>
        </Paper>
    );
}

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
    const onUpdateSuid = async (user: MemberType) => {
        if (!user.id) return;

        setUpdating(true);
        await updateUser(user.id, { ...user, suid: String(dayjs().valueOf()) });
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
        return memberList.sort((a, b) => (a.status || '')?.localeCompare(b.status || ''));
    }, [JSON.stringify(memberList)]);

    return (
        <Box>
            <Box display={'flex'} flexWrap={'wrap'} gap={2}>
                {dataList.map((m) => (
                    <CardUser key={m.id} data={m} role={profile?.role} onChangeRole={onChangeRole} onChangeStatus={onChangeStatus} />
                ))}
            </Box>

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

            {/* <TableContainer component={Paper}>
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
            </TableContainer> */}
        </Box>
    );
}

export default Member;
