// weekly_responsibilities
import { db } from '../FirebaseProvider';
import { FirebaseQuery, WeeklyScheduleData } from 'type.global';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const createScheduleWeekly = (weekly: string, payload: WeeklyScheduleData) => {
    // weekly: 'DD-MM_DD-MM-YYYY'
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(doc(db, 'weeklyResponsibilities', weekly), {
            startDate: payload.startDate,
            endDate: payload.endDate,
            userList: payload.userList,
            createdAt: payload?.createdAt ?? dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
        });

        resolve('success');
    });
};

export const getScheduleWeekly = (startDateString: string, endDateString: string) => {
    return new Promise<(FirebaseQuery & WeeklyScheduleData)[]>(async (resolve, reject) => {
        const q = query(
            collection(db, 'weeklyResponsibilities'),
            where('createdAt', '>=', startDateString), // Your date field in Firestore
            where('createdAt', '<=', endDateString)
        );
        const querySnapshot = await getDocs(q);

        const r = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as WeeklyScheduleData),
            id: doc.id,
        }));

        resolve([...r]);
    });
};
