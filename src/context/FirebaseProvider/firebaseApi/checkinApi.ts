import { db } from '../FirebaseProvider';
import {
    CalendarDateConfig,
    CheckinCalendar,
    CheckinDate,
    SystemAreaConfig,
    UserCheckInData,
    UserCheckInDate,
    UserCheckinList,
    WeeklyWorkingDays,
    WorkTimes,
} from 'type.global';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getAuth } from 'firebase/auth';

dayjs.extend(customParseFormat);

type StandardResponse<T = any> = T & {
    id: string;
};

export const getCheckinToday = (suid: string) => {
    return new Promise<StandardResponse<UserCheckInData>>(async (resolve, reject) => {
        const usersRef = collection(db, 'checkinToday');
        const q = query(usersRef, where('suid', '==', suid));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as UserCheckInData),
        }));

        if (matchedUsers.length > 0) {
            resolve({ ...matchedUsers[0] });
        } else {
            reject('not found data');
        }
    });
};
export const deleteOldCheckin = (id: string) => {
    return new Promise<string>(async (resolve, reject) => {
        await deleteDoc(doc(db, 'checkinToday', id));

        resolve('success');
    });
};
export const getCheckinTodayList = () => {
    return new Promise<UserCheckInData[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'checkinToday'));

        const res = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as UserCheckInData),
        }));

        if (res.length > 0) {
            resolve(res);
        } else {
            resolve([]);
        }
    });
};
export const addUserCheckinToday = (payload: UserCheckInData) => {
    return new Promise<string>(async (resolve, reject) => {
        await addDoc(collection(db, 'checkinToday'), payload);

        resolve('success');
    });
};

export const getCheckinCalendar = () => {
    return new Promise<CheckinCalendar[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'checkinCalendar'));
        const res: CheckinCalendar[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as CheckinCalendar),
            id: doc.id,
        }));

        const s = res.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        resolve(s);
    });
};
export const updateUserCheckin = (cId: string, userId: string, payload: UserCheckinList[]) => {
    return new Promise<{ date: string; userCheckinList: UserCheckinList[] }>(async (resolve, reject) => {
        try {
            await updateDoc(doc(db, 'checkinCalendar', cId), { userCheckinList: payload });
            if (userId) {
                await updateDoc(doc(db, 'checkinToday', userId), { status: 1 });
            }

            resolve({ date: 'string', userCheckinList: [] });
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteCalendarDay = (dayId: string) => {
    return new Promise<string>(async (resolve, reject) => {
        await deleteDoc(doc(db, 'checkinCalendar', dayId));

        resolve('success');
    });
};

export const createCheckinCalendar = (payload: { date: string; userCheckinList: [] }[]) => {
    return new Promise<string>(async (resolve, reject) => {
        const all = payload.map((d) => addDoc(collection(db, 'checkinCalendar'), d));
        await Promise.all(all);

        resolve('success');
    });
};
// --------------------------------------------------------new release-------------------------------------------------
// id: 'YYYY-M'
export const getCalendarConfig = (id: string) => {
    return new Promise<CalendarDateConfig[]>(async (resolve, reject) => {
        const docRef = doc(db, 'calendarConfig', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const res = docSnap.data() as { data: CalendarDateConfig[] };
            resolve(res.data.map((m) => ({ ...m, id: m.date })));
        } else {
            resolve([]);
        }
    });
};

// id: 'YYYY-M'
export const updateCalendarConfig = ({ id, data }: { id: string; data: CalendarDateConfig[] }) => {
    return new Promise<any>(async (resolve, reject) => {
        await setDoc(doc(db, 'calendarConfig', id), {
            data,
        });

        resolve('success');
    });
};

// startDateString,endDateString: 'YYYY-MM-DD'
export const getWorkTimeList = ({ startDateString, endDateString }: { startDateString: string; endDateString: string }) => {
    return new Promise<CheckinDate[]>(async (resolve, reject) => {
        const q = query(
            collection(db, 'workTimesList'),
            where('date', '>=', startDateString), // Your date field in Firestore
            where('date', '<=', endDateString)
            // where('status', '!=', 99)
        );
        const querySnapshot = await getDocs(q);

        const res: CheckinDate[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as CheckinDate),
            id: doc.id,
        }));
        resolve(res);
    });
};

// startDateString,endDateString: 'YYYY-MM-DD'
export const getWorkTimeListWithStatus = ({
    startDateString,
    endDateString,
    status,
}: {
    startDateString: string;
    endDateString: string;
    status: CheckinDate['status'];
}) => {
    return new Promise<CheckinDate[]>(async (resolve, reject) => {
        const q = query(
            collection(db, 'workTimesList'),
            // where('date', '>=', startDateString), // Your date field in Firestore
            // where('date', '<=', endDateString),
            where('status', '==', status)
        );
        const querySnapshot = await getDocs(q);

        const res: CheckinDate[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as CheckinDate),
            id: doc.id,
        }));
        resolve(res);
    });
};

// Overload 1: no endDate → single object or null
export function getUserWorkTime(args: { startDate: string; suid: string; endDate?: undefined }): Promise<CheckinDate | null>;

// Overload 2: with endDate → array or null
export function getUserWorkTime(args: { startDate: string; endDate: string; suid: string }): Promise<CheckinDate[] | null>;

// Implementation
// startDate,endDate: 'YYYY-MM-DD'
export function getUserWorkTime({ startDate, endDate, suid }: { startDate: string; endDate?: string; suid: string }) {
    return new Promise(async (resolve, reject) => {
        const q = query(
            collection(db, 'workTimesList'),
            where('date', '>=', startDate), // Your startDate field in Firestore
            where('date', '<=', endDate ?? startDate), // Your startDate field in Firestore
            where('suid', '==', suid)
        );
        const querySnapshot = await getDocs(q);

        const res: CheckinDate[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as CheckinDate),
            id: doc.id,
        }));

        if (res.length === 0) {
            resolve(null);
            return;
        }

        if (!endDate) {
            resolve(res[0]);
            return;
        }
        resolve(res);
    });
}

export const updateWorkTime = (payload: CheckinDate, id?: string) => {
    return new Promise<string>(async (resolve, reject) => {
        if (id) {
            console.log('payload:', payload);
            await updateDoc(doc(db, 'workTimesList', id), payload);
        } else {
            await addDoc(collection(db, 'workTimesList'), payload);
        }

        resolve('success');
    });
};
export const deleteWorkTime = (id: string) => {
    return new Promise<string>(async (resolve, reject) => {
        await deleteDoc(doc(db, 'workTimesList', id));

        resolve('success');
    });
};

export const getSystemAreaConfig = () => {
    return new Promise<SystemAreaConfig>(async (resolve, reject) => {
        const dateCollectionRef = doc(db, 'systemConfig', 'area');

        const querySnapshot = await getDoc(dateCollectionRef);

        if (querySnapshot.exists()) {
            const data = querySnapshot.data() as SystemAreaConfig;

            resolve(data);
        } else {
            reject('not found data');
        }
    });
};
export const getSystemWeeklyWorkingDaysConfig = () => {
    return new Promise<WeeklyWorkingDays>(async (resolve, reject) => {
        const dateCollectionRef = doc(db, 'systemConfig', 'weeklyWorkingDays');

        const querySnapshot = await getDoc(dateCollectionRef);

        if (querySnapshot.exists()) {
            const data = querySnapshot.data() as WeeklyWorkingDays;

            resolve(data);
        } else {
            reject('not found data');
        }
    });
};
export const getSystemWorkTimesConfig = () => {
    return new Promise<WorkTimes>(async (resolve, reject) => {
        const dateCollectionRef = doc(db, 'systemConfig', 'workTimes');

        const querySnapshot = await getDoc(dateCollectionRef);

        if (querySnapshot.exists()) {
            const data = querySnapshot.data() as WorkTimes;

            resolve(data);
        } else {
            reject('not found data');
        }
    });
};

export const updetSystemAreaConfig = (payload: SystemAreaConfig) => {
    return new Promise<string>(async (resolve, reject) => {
        await updateDoc(doc(db, 'systemConfig', 'area'), payload);

        resolve('success');
    });
};
export const updetSystemWeeklyWorkingDaysConfig = (payload: WeeklyWorkingDays) => {
    return new Promise<string>(async (resolve, reject) => {
        await updateDoc(doc(db, 'systemConfig', 'weeklyWorkingDays'), payload);

        resolve('success');
    });
};
export const updetSystemWorkTimesConfig = (payload: WorkTimes) => {
    return new Promise<string>(async (resolve, reject) => {
        await updateDoc(doc(db, 'systemConfig', 'workTimes'), payload);

        resolve('success');
    });
};
