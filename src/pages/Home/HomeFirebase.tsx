import axios from 'axios';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useGoogleLogin } from 'components/common/GoogleLoginProvider';
import { getColumnLetter } from 'helper/getColumnLetter';
import { Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import { TableBodyCell, TableHeadCell, TableHeadRow } from 'components/common/MuiTable';
import { CheckinCalendar, FirebaseQuery, Profile, SheetData, UserCheckInData, UserCheckinList } from 'type.global';
import { UserCheckIn } from 'components/UserCheckIn';
import useLocation from 'hooks/useLocation';
import { LocationChecker } from 'components/common/LocationChecker';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getCheckinCalendar, getUsersList } from 'components/common/firebase/firebaseApi/checkinApi';
import UpdateUserCheckInFirebase from 'components/UpdateUserCheckIn/UpdateUserCheckInFirebase';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

type CheckinDataList = Omit<CheckinCalendar, 'userCheckinList'> & {
    userCheckinList: (
        | (UserCheckinList & Profile & { statusText: string; absentFlag: number; lateFlag: number; timeText: string })
        | null
    )[];
};

function Home() {
    const { profile, auth2, authLoading, isSignedIn } = useGoogleLogin();
    //
    const [loading, setLoading] = useState<boolean>(true);
    const [userList, setUserList] = useState<Profile[]>([]);
    const [checkinDataList, setCheckinDataList] = useState<CheckinDataList[]>([]);

    //
    const getCheckin = async (uList: Profile[]) => {
        const c = await getCheckinCalendar();

        if (uList) {
            const m: CheckinDataList[] = c.map((d) => {
                let u: CheckinDataList['userCheckinList'] = [];
                uList.forEach((ul) => {
                    const cu = d.userCheckinList.find((f) => f.email === ul.email);
                    if (cu) {
                        let timeText = cu.time ? dayjs(Number(cu.time)).format('HH:mm') : '';
                        let remark = cu.remark;
                        let statusText = 'ตรงเวลา';
                        let absentFlag = 0;
                        let lateFlag = 0;

                        if (
                            timeText &&
                            dayjs(`${d.date} ${timeText}`, 'DD-MM-YYYY H:mm').isAfter(dayjs(`${d.date} 8:00`, 'YYYY-MM-D H:mm'))
                        ) {
                            statusText = `สาย ${statusText} ชั่วโมง`;
                            lateFlag = 1;
                        } else if (!timeText && remark.includes('ลา')) {
                            statusText = remark;
                            remark = 'ลา';
                            absentFlag = 1;
                        } else if (!timeText && !remark && dayjs(`${d.date}`, 'DD-MM-YYYY').isBefore(dayjs().add(-1, 'day'))) {
                            statusText = 'หาย';
                            lateFlag = 1;
                        }

                        u.push({ ...ul, ...cu, statusText, absentFlag, lateFlag, timeText });
                    } else {
                        u.push(null);
                    }
                });

                return {
                    date: dayjs(d.date).format('D-MM-YYYY'),
                    userCheckinList: u,
                };
            });

            setCheckinDataList([...m.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())]);
        }

        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            const res = await getUsersList();

            setUserList([...res]);

            getCheckin(res);
        };

        if (process.env.REACT_APP_ENV === 'test') {
            init();
        }
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
                            {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
                                <UpdateUserCheckInFirebase
                                    dateList={checkinDataList as CheckinCalendar[]}
                                    userList={userList}
                                    afterUndate={() => {}}
                                    // getCheckin={getCheckin}
                                />
                            )}
                            {/* {profile?.id && isAllowLocation && (isIOS || isAndroid) && isMobile && <UserCheckIn getCheckin={getCheckin} />} */}
                            {profile?.email && process.env.REACT_APP_ENV === 'test' && <UserCheckIn />}
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
                                                    {u?.timeText && ' - '}
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
