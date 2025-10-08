import { db } from 'context/FirebaseProvider/FirebaseProvider';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { backup, leaveList } from './backupData';
import { backup as backupCopy } from './backupData-copy';
import { CheckinDate } from 'type.global';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

function Demo() {
    const addAllItems = async (items: any[]) => {
        const CHUNK_SIZE = 500; // Firestore batch limit
        const chunks = [];

        // Split into chunks of 500
        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            chunks.push(items.slice(i, i + CHUNK_SIZE));
        }

        // Process each chunk sequentially
        for (const chunk of chunks) {
            const batch = writeBatch(db);
            const colRef = collection(db, 'workTimeList');

            chunk.forEach((item) => {
                const docRef = doc(colRef); // auto ID
                batch.set(docRef, item);
            });

            await batch.commit();
            console.log(`Batch of ${chunk.length} documents written`);
        }

        console.log('✅ All items added successfully!');
    };

    useEffect(() => {
        const init = async () => {
            // const q = query(
            //     collection(db, 'workTimeList')
            //     // where('leavePeriod', '==', 'HALF_DAY_AM')
            //     // where('leavePeriod', '==', 'HALF_DAY_PM')
            //     // where('absentId', '!=', null)
            // );
            // const querySnapshot = await getDocs(q);

            // // const querySnapshot = await getDocs(collection(db, 'workTimeList'));
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

            console.log('r:', leaveList);
            console.log(
                'backup:',
                backup.filter((f) => f.name === '' && f.email)
            );

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
    return <div></div>;
}

export default Demo;
