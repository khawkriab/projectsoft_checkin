import { Box, Stack, Table, TableBody, TableContainer, TableRow, Typography } from '@mui/material';
import { TableBodyCell } from 'components/common/MuiTable';
import { useEffect, useMemo, useState } from 'react';
import { MobileDatePicker, MobileDatePickerProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import { LeaveData, FirebaseQuery, LeavePeriodsType, LeaveTypes, Profile } from 'type.global';
import { getLeaveList } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { getLeavePeriodLabel, getLeaveType, leavePeriods, leaveTypes } from 'helper/leaveType';
import { FilterCheckinUser } from 'components/common/FilterCheckinUser';
import { getUsersList } from 'context/FirebaseProvider/firebaseApi/userApi';

dayjs.locale('th');

type LeaveForm = {
    leaveType?: LeaveTypes;
    leavePeriod?: LeavePeriodsType;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    reason: string;
};

function CustomMobileDatePicker(props: MobileDatePickerProps) {
    const [showDialog, setShowDialog] = useState(false);
    return (
        <MobileDatePicker
            {...props}
            open={showDialog}
            onOpen={() => setShowDialog(true)}
            onClose={() => setShowDialog(false)}
            format='DD/MM/YYYY'
            sx={{
                '& .MuiPickersOutlinedInput-root.Mui-disabled *': {
                    color: '#000',
                },
            }}
            slotProps={{
                textField: {
                    fullWidth: true,
                    onClick: () => setShowDialog(true),
                    disabled: true,
                    InputLabelProps: {
                        shrink: true,
                    },
                    ...props?.slotProps?.textField,
                },
            }}
        />
    );
}

function LeaveRequest() {
    const [leaveList, setLeaveList] = useState<(FirebaseQuery & LeaveData)[]>([]);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [userFilterList, setUserFilterList] = useState<Profile[]>([]); // default all user
    //

    const userListFilter = useMemo(() => {
        if (userFilterList.length <= 0) return [];

        const eml = userFilterList.map((m) => m.suid);
        return leaveList.filter((f) => eml.includes(f.suid));
    }, [JSON.stringify(leaveList), JSON.stringify(userFilterList)]);

    useEffect(() => {
        const getLeave = async () => {
            try {
                const res = await getLeaveList();
                setLeaveList([...res]);
            } catch (error) {
                console.log('error:', error);
            }
        };

        const getAllUser = async () => {
            try {
                const res = await getUsersList();
                setUserList(res);
            } catch (error) {
                console.log('error:', error);
            }
        };

        getLeave();
        getAllUser();
    }, []);

    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} spacing={2}>
                <Typography variant='h5'>ประวัติการลา</Typography>
                <FilterCheckinUser userList={userList} onChangeFilter={(values) => setUserFilterList([...values])} />
            </Stack>
            <hr style={{ width: '100%', margin: '12px 0 24px' }} />
            <Box>
                <TableContainer>
                    <Table>
                        <TableBody>
                            {userListFilter.map((m) => (
                                <TableRow key={m.id}>
                                    <TableBodyCell>{m.name}</TableBodyCell>
                                    <TableBodyCell>{`${dayjs(m.startDate).format('DD/MM/YYYY')} - ${dayjs(m.endDate).format(
                                        'DD/MM/YYYY'
                                    )}`}</TableBodyCell>
                                    <TableBodyCell>{`${getLeaveType(m.leaveType)} - ${getLeavePeriodLabel(m.leavePeriod)}`}</TableBodyCell>
                                    <TableBodyCell>{m.reason}</TableBodyCell>
                                    <TableBodyCell>{m.status}</TableBodyCell>
                                    <TableBodyCell>by: {m.approveBy}</TableBodyCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default LeaveRequest;
