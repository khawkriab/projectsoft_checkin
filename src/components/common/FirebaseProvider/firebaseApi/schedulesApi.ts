// weekly_responsibilities
import { db } from '../FirebaseProvider';
import { FirebaseQuery, WeeklySchedule } from 'type.global';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const createScheduleWeekly = (payload: WeeklySchedule) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(doc(db, 'weeklyResponsibilities', 'weekly', 'DD-MM_DD-MM-YYYY'), {
            startDate: payload.startDate,
            endDate: payload.endDate,
            userList: payload.userList,
            createdAt: payload?.createdAt ?? dayjs().toISOString(),
            updatedAt: dayjs().toISOString(),
        });

        resolve('success');
    });
};

export const getScheduleWeekly = () => {
    return new Promise<(FirebaseQuery & WeeklySchedule)[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'weekly_responsibilities'));

        const r = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as WeeklySchedule),
            id: doc.id,
        }));

        resolve([...r]);
    });
};
