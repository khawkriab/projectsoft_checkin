import { Box, Button, Chip, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useFirebase } from 'context/FirebaseProvider';
import { updateUser, getUsersList, updateAnnualLeaveEntitlement } from 'context/FirebaseProvider/firebaseApi/userApi';
import { useEffect, useMemo, useState } from 'react';
import { Profile, ProfileRole, ProfileStatus } from 'type.global';
import dayjs from 'dayjs';
import CopyBox from 'components/common/CopyBox';
import { useNotification } from 'components/common/NotificationCenter';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ModalEditUser from './component/ModalEditUser';
import ProfileImage from 'components/common/ProfileImage';

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
    onEditUser,
}: {
    data: Profile;
    role?: ProfileRole;
    onChangeRole: (role: Profile['role'], user: Profile) => Promise<void>;
    onChangeStatus: (user: Profile, status: ProfileStatus) => Promise<void>;
    onEditUser: (user: Profile) => void;
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
                display: 'flex',
                flexDirection: 'column',
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
            <ProfileImage fileUrl={data.profileURL} firstName={data.name} />
            {/* <Box width={'60px'} height={'60px'} borderRadius={'100%'} overflow={'hidden'} bgcolor={'#cccccc'}>
                <Box component={'img'} src={data.profileURL || ''} sx={{ objectFit: 'contain', width: '100%', height: '100%' }} />
            </Box> */}
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
                <BoxBetween label='สถานะบัญชี:'>
                    <Chip
                        size='small'
                        label={data.status === 'APPROVE' ? 'ใช้งาน' : data.status === 'WAITING' ? 'รอ' : 'ปิดบัญชี'}
                        color={data.status === 'APPROVE' ? 'success' : data.status === 'WAITING' ? 'warning' : 'error'}
                    />
                </BoxBetween>
                <BoxBetween label='วันเริ่มทำงาน:'>{data.employmentStartDate}</BoxBetween>
                <BoxBetween label='วันสิ้นสุดการทำงาน:'>{data.employmentEndDate}</BoxBetween>
                <BoxBetween label='Role:'>
                    {role === 'ADMIN' ? (
                        <ToggleButtonGroup
                            // disabled={updating}
                            size='small'
                            color='error'
                            exclusive
                            value={data.role}
                            onChange={(_, value) => {
                                if (value === 'INACTIVE') {
                                    onChangeStatus(data, 'INACTIVE');
                                } else {
                                    onChangeRole(value as Profile['role'], data);
                                }
                            }}
                        >
                            <ToggleButton value='ADMIN'>Admin</ToggleButton>
                            <ToggleButton value='STAFF'>Staff</ToggleButton>
                            <ToggleButton value='USER'>User</ToggleButton>
                            {/* <ToggleButton value='INACTIVE'>Inactive User</ToggleButton> */}
                        </ToggleButtonGroup>
                    ) : (
                        data.role
                    )}
                </BoxBetween>
            </Box>
            <Box display={'flex'} justifyContent={'flex-end'} marginTop={'auto'} paddingTop={3}>
                <Button variant='contained' size='small' onClick={() => onEditUser(data)}>
                    <DriveFileRenameOutlineIcon /> Edit
                </Button>
            </Box>
        </Paper>
    );
}

function AddAnnualLeaveEntitlement({ user }: { user: Profile }) {
    const [loading, setLoading] = useState(false);

    const onUpdate = async () => {
        await updateAnnualLeaveEntitlement(user.suid, 2025, {
            personal: 999,
            sick: 999,
            vacation: 7,
            years: 2025,
        });
        alert('seccess');
    };
    return (
        <Box>
            <Button variant='contained' onClick={onUpdate}>
                add
            </Button>
        </Box>
    );
}

function Member() {
    const { profile } = useFirebase();
    const { openNotify } = useNotification();
    //
    const [memberList, setMemberList] = useState<Profile[]>([]);
    const [updating, setUpdating] = useState(false);
    const [openEdit, setOpenEdit] = useState<{ open: boolean; data: Profile | null }>({ open: false, data: null });

    //

    // const onApprove = async (user: Profile) => {
    //     if (!user.id) return;
    //     setUpdating(true);
    //     await updateUser(user.id, { ...user, status: 'APPROVE' });
    //     setOpen(true);
    //     getUserList();
    // };
    const onChangeStatus = async (user: Profile, status: ProfileStatus) => {
        if (!user.id) return;
        setUpdating(true);
        await updateUser(user.id, { ...user, status: status });
        openNotify('success', 'Update success');
        getUserList();
    };
    const onUpdateSuid = async (user: Profile) => {
        if (!user.id) return;

        setUpdating(true);
        await updateUser(user.id, { ...user, suid: String(dayjs().valueOf()) });
        openNotify('success', 'Update success');
        getUserList();
    };

    const onChangeRole = async (role: Profile['role'], user: Profile) => {
        if (!user.id) return;

        try {
            const status = user.status === 'INACTIVE' ? 'APPROVE' : user.status;
            setUpdating(true);
            await updateUser(user.id, { ...user, role: role, status: status });
            openNotify('success', 'Update success');
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
                    <CardUser
                        key={m.id}
                        data={m}
                        role={profile?.role}
                        onChangeRole={onChangeRole}
                        onChangeStatus={onChangeStatus}
                        onEditUser={(data) => setOpenEdit((prev) => ({ ...prev, open: true, data: data }))}
                    />
                ))}
            </Box>

            {openEdit.open && openEdit.data && (
                <ModalEditUser data={openEdit.data} onClose={() => setOpenEdit((prev) => ({ ...prev, open: false, data: null }))} />
            )}
        </Box>
    );
}

export default Member;
