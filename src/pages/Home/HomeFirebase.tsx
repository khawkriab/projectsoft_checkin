import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { CheckinCalendar, Profile, UserCheckinList } from 'type.global';
import { UserCheckIn } from 'components/UserCheckIn';
import utc from 'dayjs/plugin/utc';
import UpdateUserCheckInFirebase from 'components/UpdateUserCheckIn/UpdateUserCheckInFirebase';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useFirebase } from 'components/common/FirebaseProvider';
import { getCheckinCalendar } from 'components/common/FirebaseProvider/firebaseApi/checkinApi';
import { getUsersList } from 'components/common/FirebaseProvider/firebaseApi/userApi';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export type CheckinDataList = Omit<CheckinCalendar, 'userCheckinList'> & {
    userCheckinList: (
        | (UserCheckinList & Profile & { statusText: string; absentFlag: number; lateFlag: number; timeText: string })
        | null
    )[];
};

function Home() {
    const { profile, authLoading, isSignedIn } = useFirebase();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [checkinDataList, setCheckinDataList] = useState<CheckinDataList[]>([]);

    //
    const getCheckin = async (uList: Profile[]) => {
        const c = await getCheckinCalendar();

        if (uList.length > 0) {
            const m: CheckinDataList[] = c.map((d) => {
                let checkinData: CheckinDataList['userCheckinList'] = [];
                const isBeforeDay = dayjs(d.date).isBefore(dayjs().add(-1, 'day'));

                uList.forEach((ul) => {
                    const userCheckin = d.userCheckinList.find((f) => f?.email === ul.email);

                    if (userCheckin) {
                        // time: HH:mm
                        let timeText = userCheckin?.time ? userCheckin.time : '';
                        let remark = userCheckin?.remark ?? '';
                        let statusText = 'ตรงเวลา';
                        let absentFlag = 0;
                        let lateFlag = 0;

                        if (timeText && dayjs(`${d.date} ${timeText}`).isAfter(dayjs(`${d.date} 08:00`))) {
                            statusText = `สาย ${dayjs(`${d.date} ${timeText}`).diff(dayjs(`${d.date} 08:00`), 'minutes')} นาที`;
                            lateFlag = 1;
                        } else if (!timeText && remark.includes('ลา')) {
                            statusText = remark;
                            remark = 'ลา';
                            absentFlag = 1;
                        } else if (!remark && !timeText && isBeforeDay) {
                            statusText = 'หาย';
                            lateFlag = 1;
                        }
                        checkinData.push({ ...ul, ...userCheckin, statusText, absentFlag, lateFlag, timeText });
                    } else if (isBeforeDay) {
                        checkinData.push({
                            ...ul,
                            email: ul.email,
                            googleId: ul.googleId,
                            statusText: 'หาย',
                            absentFlag: 0,
                            lateFlag: 1,
                            timeText: '',
                            remark: '',
                            reason: '',
                            time: '',
                        });
                    } else {
                        checkinData.push(null);
                    }
                });

                return {
                    id: d.id,
                    date: dayjs(d.date).format('DD-MM-YYYY'),
                    userCheckinList: checkinData,
                };
            });

            setCheckinDataList([...m]);
        }

        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            const res = await getUsersList();

            setUserList([...res]);

            getCheckin(res);
        };

        init();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* <LocationChecker /> */}
            <Box sx={{ marginBottom: 4 }}>
                {authLoading ? (
                    <div>Loading...</div>
                ) : (
                    isSignedIn && (
                        <>
                            {profile?.googleId && (
                                <UserCheckIn checkinToday={checkinDataList.find((f) => f.date === dayjs().format('DD-MM-YYYY'))} />
                            )}
                            {/* {profile?.email && process.env.REACT_APP_ENV === 'test' && (
                                <UserCheckIn checkinToday={checkinDataList.find((f) => f.date === dayjs().format('DD-MM-YYYY'))} />
                            )} */}
                            {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                                <UpdateUserCheckInFirebase
                                    dateList={checkinDataList as CheckinCalendar[]}
                                    userList={userList}
                                    afterUndate={() => getCheckin(userList)}
                                    // getCheckin={getCheckin}
                                />
                            )}
                        </>
                    )
                )}
            </Box>
            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'ชื่อพนักงาน'}</TableHeadCell>
                                {userList.map((user, index) => {
                                    return (
                                        <TableHeadCell key={index} colSpan={2} align='center' sx={{ borderLeft: '1px solid #fff' }}>
                                            {user.name}
                                        </TableHeadCell>
                                    );
                                })}
                            </TableHeadRow>
                            <TableHeadRow>
                                <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'วันที่'}</TableHeadCell>
                                {userList.map((_, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'เวลาเข้าทำงาน'}</TableHeadCell>
                                            <TableHeadCell sx={{ borderLeft: '1px solid #fff' }}>{'สถานะ'}</TableHeadCell>
                                        </React.Fragment>
                                    );
                                })}
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            {checkinDataList.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableBodyCell
                                        sx={(theme) => ({
                                            border: '1px solid',
                                            borderLeftColor: theme.palette.secondary.contrastText,
                                        })}
                                    >
                                        {row.date}
                                    </TableBodyCell>
                                    {row.userCheckinList.map((u, uIndex) => (
                                        <React.Fragment key={`${uIndex}-${u?.name}`}>
                                            {/* เวลาเข้าทำงาน */}
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                {u?.timeText}
                                                <Box display={'inline-block'} color={'#ff6f00'} fontWeight={700}>
                                                    {u?.timeText && u?.remark && ' - '}
                                                    {u?.remark}
                                                </Box>
                                            </TableBodyCell>
                                            {/* สถานะ */}
                                            <TableBodyCell
                                                sx={(theme) => ({
                                                    border: '1px solid',
                                                    borderLeftColor: theme.palette.secondary.contrastText,
                                                })}
                                            >
                                                <Box
                                                    sx={{
                                                        padding: '2px 4px',
                                                        borderRadius: 1,
                                                        backgroundColor: u?.lateFlag ? '#f00' : u?.absentFlag ? '#ff6f00' : '',
                                                        color: u?.lateFlag || u?.absentFlag ? '#ffffff' : '',
                                                        textAlign: u?.lateFlag || u?.absentFlag ? 'center' : '',
                                                    }}
                                                >
                                                    {u?.statusText}
                                                </Box>
                                                <Box>{u?.reason}</Box>
                                            </TableBodyCell>
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
}

export default Home;
