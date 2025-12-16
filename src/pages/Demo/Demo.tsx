import { db } from 'context/FirebaseProvider/FirebaseProvider';
import { and, collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { CheckinDate, Profile } from 'type.global';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button } from '@mui/material';
// import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts';
import ModalEditUser from 'pages/Member/component/ModalEditUser';
import { createLeave } from 'context/FirebaseProvider/firebaseApi/leaveApi';
import { getUserWorkTime } from 'context/FirebaseProvider/firebaseApi/checkinApi';
// import { workTimeList } from './backupData20251119';
import isBetween from 'dayjs/plugin/isBetween';
import PublicDriveImage from 'components/common/ProfileImage';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(isBetween);

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
    const onBatchAction = async (items: any[] = []) => {
        // const items: any[] = [];
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
                    const docRef = doc(db, 'workTimesList', item.id);
                    // const docRef = doc(colRef); // auto ID
                    delete item.id;
                    // batch.set(docRef, item);
                    batch.delete(docRef);
                });

                await batch.commit();
                console.log(`Batch of ${chunk.length} documents written`);
            }

            console.log('✅ All items added successfully!');
        } catch (error) {
            console.error('error:', error);
        }
    };

    const onX = async () => {
        await createLeave({
            name: 'เอ็ม',
            email: 'm.teerapolph@gmail.com',
            suid: '1763004024894',
            leaveType: 'VACATION',
            leavePeriod: 'FULL_DAY',
            startDate: '2025-06-09',
            endDate: '2025-06-20',
            reason: 'ลาบวช',
            status: 'WAITING',
            approveBy: '',
            approveBySuid: '',
        });

        alert('success');
    };

    useEffect(() => {
        const init = async () => {
            // const n = workTimeList
            //     .filter((f) => dayjs(f.date).isBetween('2025-06-27', dayjs('2025-07-02'), 'day') && f.name === 'm.teerapolph@gmail.com')
            //     .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
            // console.log('n:', n);
            // const res = await getUserWorkTime({
            //     startDate: '2025-06-06',
            //     endDate: '2025-06-20',
            //     suid: '1763004024894',
            // });
            // const q = query(
            //     collection(db, 'workTimesList'),
            //     and(
            //         where('time', '==', ''), // Your date field in Firestore
            //         where('reason', '==', ''),
            //         where('approveBy', '==', ''),
            //         where('remark', '==', '')
            //         // where('status', '!=', 99)
            //     )
            // );
            // const querySnapshot = await getDocs(q);
            // const res: CheckinDate[] = querySnapshot.docs.map((doc) => ({
            //     ...(doc.data() as CheckinDate),
            //     id: doc.id,
            // }));
            // onBatchAction(res);
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
        };

        init();
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
            <Button onClick={onX}>x</Button>
            <PublicDriveImage fileUrl='https://drive.google.com/file/d/1CbH9cK8LHuQEHy6mKKYIrq7mqdlcFvhi/view?usp=sharing' />
            <PublicDriveImage firstName='Khawkriab' />
            {/* <img src='https://photos.google.com/share/AF1QipMhjpH-Oh0wEVib8U3xbhxhD2Gvq7m_vAld9iAS2iPH4Ez_4hZRJtCbNsq89Ofnag?key=eVdpeHA4SWtXTEk2UE5RQWwzMml4SkRkNFFidldR' /> */}
            {/* <ModalEditUser data={userProfile} /> */}
        </div>
    );
}

export default Demo;
