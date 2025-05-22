import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useGoogleLogin } from 'components/GoogleLoginProvider';
import { TableBodyCell, TableHeadCell } from 'components/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { Profile } from 'type.global';

type MemberType = Profile;

function Member() {
    const { getUserList } = useGoogleLogin();
    const [memberList, setMemberList] = useState<MemberType[]>([]);
    //
    useEffect(() => {
        const init = async () => {
            const arr = await getUserList();
            setMemberList([...arr]);
        };

        init();
    }, []);

    const dataList = useMemo(() => {
        return memberList.filter((f) => f.id);
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataList.map((u) => (
                            <TableRow key={u.id}>
                                <TableBodyCell>{u.fullName}</TableBodyCell>
                                <TableBodyCell>{u.name}</TableBodyCell>
                                <TableBodyCell>{u.email}</TableBodyCell>
                                <TableBodyCell>{u.phoneNumber}</TableBodyCell>
                                <TableBodyCell>{u.jobPosition}</TableBodyCell>
                                <TableBodyCell>{u.employmentType}</TableBodyCell>
                                <TableBodyCell>{u.role}</TableBodyCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default Member;
