import { db } from 'context/FirebaseProvider/FirebaseProvider';
import { collection, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { CheckinDate } from 'type.global';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Button } from '@mui/material';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const userList = [
    {
        googleId: '',
        email: 'assasin4442@gmail.com',
        name: 'oos',
        suid: '1763004020537',
    },
    {
        googleId: '',
        email: 'jakkapan199610@gmail.com',
        name: 'oos',
        suid: '1763004020537',
    },
    {
        googleId: '',
        email: 'pre.register1@checkin.com',
        name: 'ออส',
        suid: '1763004020537',
    },
    {
        googleId: '113844255012024153757',
        email: 'khawkriab.game@gmail.com',
        name: 'test',
        suid: '1763003931374',
    },
    {
        googleId: '114194861929575502045',
        email: 'khawkriab.dev@gmail.com',
        name: 'กล้า',
        suid: '1763003938364',
    },
    {
        googleId: '115717476819625119380',
        email: 'supacharn.kaowanan@gmail.com',
        name: 'เจเจ',
        suid: '1763003942954',
    },
    {
        googleId: '109763643574192808243',
        email: 'chophaka.chi@gmail.com',
        name: 'ช่อ',
        suid: '1763003947484',
    },
    {
        googleId: '106041925538909132422',
        email: 'akaratsiriwat@gmail.com',
        name: 'เด็ดเดี่ยว',
        suid: '1763003953762',
    },
    {
        googleId: '114023034568874459683',
        email: 'pechmanee.bt@kkumail.com',
        name: 'โดนัท',
        suid: '1763003963970',
    },
    {
        googleId: '104592545300787905554',
        email: 'nutchanat.nsr@gmail.com',
        name: 'น้ำ',
        suid: '1763003970127',
    },
    {
        googleId: '',
        email: 'nuttapat350@gmail.com',
        name: 'น้ำอุ่น',
        suid: '1763003976467',
    },
    {
        googleId: '',
        email: 'big.siravit@gmail.com',
        name: 'บิ๊ก',
        suid: '1763003982726',
    },
    {
        googleId: '',
        email: 'pre.register4@checkin.com',
        name: 'ป้อง',
        suid: '1763003989928',
    },
    {
        googleId: '',
        email: 'contact@projectsoft.co.th',
        name: 'ผู้ดูแล',
        suid: '1763003996445',
    },
    {
        googleId: '100557811553068873527',
        email: 'pearpitchaporn@gmail.com',
        name: 'แพร',
        suid: '1763004001411',
    },
    {
        googleId: '110251362748801852206',
        email: 'rakgorak@gmail.com',
        name: 'รักษ์',
        suid: '1763004006908',
    },
    {
        googleId: '111547067079422404518',
        email: 'patiphan.wa@gmail.com',
        name: 'เวฟ',
        suid: '1763004011326',
    },
    {
        googleId: '114162045479402567217',
        email: 'chettaphon.contact@gmail.com',
        name: 'หนึ่ง',
        suid: '1763004015946',
    },

    {
        googleId: '105443597185074019229',
        email: 'm.teerapolph@gmail.com',
        name: 'เอ็ม',
        suid: '1763004024894',
    },
    {
        googleId: '117596898184769890110',
        email: 'w.chawanut@kkumail.com',
        name: 'เอิร์ธ',
        suid: '1763004028733',
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
            <Button variant='contained' onClick={addAllItems}>
                test
            </Button>
        </div>
    );
}

export default Demo;
