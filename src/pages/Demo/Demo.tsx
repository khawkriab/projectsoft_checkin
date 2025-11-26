import { db } from 'context/FirebaseProvider/FirebaseProvider';
import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { CheckinDate, Profile } from 'type.global';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button } from '@mui/material';
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';
import ModalEditUser from 'pages/Member/component/ModalEditUser';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const userProfile: Profile = {
    role: 'USER',
    name: 'oos',
    jobPosition: 'Back-End',
    email: 'jakkapan199610@gmail.com',
    status: 'APPROVE',
    employmentEndDate: '',
    fullName: 'jakkapan',
    employmentStartDate: '2025-01-01',
    phoneNumber: '',
    suid: '1763004020537',
    employmentType: 'Company Employee',
    updatedAt: '2025-11-13T03:18:44.174Z',
    profileURL: '',
    googleUid: 'qg4vQmYIl3YVRHLt2Aesk1luM392',
    id: '1763004020537',
};

// #region Sample data
const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

function Demo() {
    const addAllItems = async () => {
        const items: any[] = [];
        const CHUNK_SIZE = 500; // Firestore batch limit
        const chunks = [];

        // Split into chunks of 500
        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            chunks.push(items.slice(i, i + CHUNK_SIZE));
        }

        console.log('start batch');
        try {
            // Process each chunk sequentially
            for (const chunk of chunks) {
                console.log('chunk of chunks');
                const batch = writeBatch(db);
                const colRef = collection(db, 'workTimesList');

                chunk.forEach((item) => {
                    // const docRef = doc(db, 'leaveListX', item.id);
                    const docRef = doc(colRef); // auto ID
                    delete item.id;
                    batch.set(docRef, item);
                });

                await batch.commit();
                console.log(`Batch of ${chunk.length} documents written`);
            }

            console.log('✅ All items added successfully!');
        } catch (error) {
            console.error('error:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            // const q = query(
            //     collection(db, 'usersList')
            //     // where('leavePeriod', '==', 'HALF_DAY_AM')
            //     // where('leavePeriod', '==', 'HALF_DAY_PM')
            //     // where('absentId', '!=', null)
            // );
            // const querySnapshot = await getDocs(q);
            // // // const querySnapshot = await getDocs(collection(db, 'workTimeList'));
            // const res: any[] = querySnapshot.docs.map((doc) => ({
            //     ...doc.data(),
            //     id: doc.id,
            // }));
            // console.log('res:', res);
            // console.log(
            //     'res:',
            //     // res.filter((f) => f.email === 'khawkriab.game@gmail.com')
            //     res
            //         .map((f) => ({ email: f.email, leavePeriod: f.leavePeriod, date: f.date }))
            //         .sort((a, b) => (a.date as string).localeCompare(b.date))
            // );
            // const usersRef = collection(db, 'absentList');
            // const q1 = query(usersRef, where('status', '==', 'APPROVE'));
            // const querySnapshot1 = await getDocs(q1);
            // const absentList = querySnapshot1.docs.map((doc) => ({
            //     id: doc.id,
            //     ...doc.data(),
            // }));
            // console.log('r:', leaveList);
            // console.log(
            //     'backup:',
            //     backup.filter((f) => f.name === '' && f.email)
            // );
            // addAllItems(backup);
            // const updateData = backup.map((m) => {
            //     if (m.absentId) {
            //         const fl = leaveList.find((f) => f.id === m.absentId);
            //         if (fl) {
            //             return {
            //                 ...m,
            //                 remark: '',
            //                 leaveType: fl.leaveType,
            //                 leavePeriod: fl.leavePeriod,
            //                 isWorkOutside: m.isWFH,
            //             };
            //         }
            //         return {
            //             ...m,
            //             leaveType: 'VACATION',
            //             leavePeriod: 'FULL_DAY',
            //             isWorkOutside: m.isWFH,
            //         };
            //     }
            //     return {
            //         ...m,
            //         leaveType: null,
            //         leavePeriod: null,
            //         isWorkOutside: m.isWFH,
            //     };
            // });
            // console.log('updateData2:', updateData);
            // console.log('res:', res);
            // const workTimeList = res.filter((f) => !!f.leavePeriod || !!f.absentId);
            // const updateWorkTimeList = workTimeList.map(m=>{
            //     if()
            // })
            // deleteDoc(doc(db, 'checkinToday', id));
        };

        init();
    }, []);

    useEffect(() => {
        const remap = () => {
            // const n = backupData.map((m) => {
            //     const cu = userList.find((f) => f.email === m.email);
            //     const ab = userList.find((f) => f.googleId === m.approveByGoogleId);
            //     return {
            //         ...m,
            //         suid: cu?.suid || 'nodata',
            //         approveBySuid: ab?.suid || 'nodata',
            //     };
            // });
            // console.log('n:', n);
            // console.log('backupData:', backupData.length);
            // const r = remapData.filter((f) => !!f.approveBySuid);
        };

        // remap();
    }, []);
    return (
        <div>
            {/* <BarChart width={400} height={300} data={data} layout='vertical'>
                <XAxis type='number' />
                <YAxis type='category' dataKey='name' />
                <Tooltip />
                <Bar dataKey='uv' fill='#8884d8' />
                <Bar dataKey='pv' fill='#ff0000' />
            </BarChart> */}

            <ModalEditUser data={userProfile} />
        </div>
    );
}

export default Demo;
