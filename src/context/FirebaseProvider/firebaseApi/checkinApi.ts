import { db } from '../FirebaseProvider';
import { CalendarDateConfig, CheckinCalendar, UserCheckInData, UserCheckInDate, UserCheckinList } from 'type.global';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getAuth } from 'firebase/auth';

dayjs.extend(customParseFormat);

type StandardResponse<T = any> = T & {
    id: string;
};

export const getCheckinToday = (googleId: string) => {
    return new Promise<StandardResponse<UserCheckInData>>(async (resolve, reject) => {
        const usersRef = collection(db, 'checkinToday');
        const q = query(usersRef, where('googleId', '==', googleId));

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
export const updateUserCheckinCalendar = (payload: {
    year: number;
    month: number;
    date: number;
    checkinTodayId?: string;
    approveBy?: string;
    approveByGoogleId?: string;
    userCheckinList: UserCheckinList[];
}) => {
    return new Promise<{ date: string; userCheckinList: UserCheckinList[] }>(async (resolve, reject) => {
        try {
            await updateDoc(doc(db, 'calendar', String(payload.year), 'month', String(payload.month + 1), 'date', String(payload.date)), {
                userCheckinList: payload.userCheckinList,
            });
            if (payload.checkinTodayId) {
                await updateDoc(doc(db, 'checkinToday', payload.checkinTodayId), {
                    status: 1,
                    approveBy: payload.approveBy,
                    approveByGoogleId: payload.approveByGoogleId,
                });
            }

            resolve({ date: 'string', userCheckinList: [] });
        } catch (error) {
            reject(error);
        }
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
export const createCalendarMonthOfYears = (
    payload: {
        year: number; // YYYY
        month: number; // 0 - 11
        date: number; // 1 - 31
        wfhFlag: number; // 0 | 1
        userCheckinList: UserCheckinList[];
    }[]
) => {
    return new Promise<string>(async (resolve, reject) => {
        const all = payload.map((d) =>
            setDoc(doc(db, 'calendar', String(d.year), 'month', String(d.month + 1), 'date', String(d.date)), {
                date: `${d.year}-${d.month + 1}-${d.date}`,
                wfhFlag: d.wfhFlag,
                userCheckinList: d.userCheckinList,
            })
        );
        await Promise.all(all);

        resolve('success');
    });
};
export const updateCalendarMonthOfYears = (payload: {
    year: number; // YYYY
    month: number; // 0 - 11
    date: number; // 1 - 31
    wfhFlag: number; // 0 | 1
    userCheckinList: UserCheckinList[];
}) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(doc(db, 'calendar', String(payload.year), 'month', String(payload.month + 1), 'date', String(payload.date)), {
            date: `${payload.year}-${payload.month + 1}-${payload.date}`,
            wfhFlag: payload.wfhFlag,
            userCheckinList: payload.userCheckinList,
        });

        resolve('success');
    });
};
export const deleteCalendarMonthOfYears = (
    payload: {
        year: number; // YYYY
        month: number; // 0 - 11
        date: number; // 1 - 31
    }[]
) => {
    return new Promise<string>(async (resolve, reject) => {
        const all = payload.map((d) =>
            deleteDoc(doc(db, 'calendar', String(d.year), 'month', String(d.month + 1), 'date', String(d.date)))
        );
        await Promise.all(all);

        resolve('success');
    });
};
export const getCalendarMonthOfYears = (payload: {
    year: number; // YYYY
    month: number; // 0 - 11
}) => {
    return new Promise<CheckinCalendar[]>(async (resolve, reject) => {
        const dateCollectionRef = collection(db, 'calendar', String(payload.year), 'month', String(payload.month + 1), 'date');

        const querySnapshot = await getDocs(dateCollectionRef);

        const dates: CheckinCalendar[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as CheckinCalendar),
        }));

        const s = dates.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        resolve(s);
    });
};
export const getCalendarDateOfMonth = (payload: {
    date: number; // D
    year: number; // YYYY
    month: number; // 0 - 11
}) => {
    return new Promise<CheckinCalendar>(async (resolve, reject) => {
        const dateCollectionRef = doc(
            db,
            'calendar',
            String(payload.year),
            'month',
            String(payload.month + 1),
            'date',
            String(payload.date)
        );

        const querySnapshot = await getDoc(dateCollectionRef);

        if (querySnapshot.exists()) {
            const data = querySnapshot.data() as CheckinCalendar;
            resolve(data);
        } else {
            reject('not found data');
        }
    });
};

// --------------------------------------------------------new release-------------------------------------------------
// id: 'YYYY-M'
export const getCalendarConfig = ({ id }: { id: string }) => {
    return new Promise<{ data: CalendarDateConfig[] }>(async (resolve, reject) => {
        const docRef = doc(db, 'calendarConfig', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            resolve(docSnap.data() as { data: CalendarDateConfig[] });
        } else {
            resolve({ data: [] });
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
    return new Promise<StandardResponse<UserCheckInDate>[]>(async (resolve, reject) => {
        const q = query(
            collection(db, 'workTimeList'),
            where('date', '>=', startDateString), // Your date field in Firestore
            where('date', '<=', endDateString)
        );
        const querySnapshot = await getDocs(q);

        // const querySnapshot = await getDocs(collection(db, 'workTimeList'));
        const res: StandardResponse<UserCheckInDate>[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as UserCheckInDate),
            id: doc.id,
        }));
        resolve(res);
    });
};

// Overload 1: no endDate → single object or null
export function getUserWorkTime(args: {
    startDate: string;
    email: string;
    endDate?: undefined;
}): Promise<StandardResponse<UserCheckInDate> | null>;

// Overload 2: with endDate → array or null
export function getUserWorkTime(args: {
    startDate: string;
    endDate: string;
    email: string;
}): Promise<StandardResponse<UserCheckInDate>[] | null>;

// Implementation
// startDate,endDate: 'YYYY-MM-DD'
export function getUserWorkTime({ startDate, endDate, email }: { startDate: string; endDate?: string; email: string }) {
    return new Promise(async (resolve, reject) => {
        const q = query(
            collection(db, 'workTimeList'),
            where('date', '>=', startDate), // Your startDate field in Firestore
            where('date', '<=', endDate ?? startDate), // Your startDate field in Firestore
            where('email', '==', email)
        );
        const querySnapshot = await getDocs(q);

        // const querySnapshot = await getDocs(collection(db, 'workTimeList'));
        const res: StandardResponse<UserCheckInDate>[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as UserCheckInDate),
            id: doc.id,
        }));

        if (res.length === 0) {
            resolve(null);
            return;
        }

        if (!endDate) {
            resolve([res[0]]);
            return;
        }
        resolve(res);
    });
}

export const updateWorkTime = (payload: UserCheckInDate, id?: string, checkinTodayId?: string) => {
    return new Promise<string>(async (resolve, reject) => {
        if (id) {
            await updateDoc(doc(db, 'workTimeList', id), payload);
        } else {
            await addDoc(collection(db, 'workTimeList'), payload);
            // addDoc(collection(db, 'checkinCalendar'), d)
        }

        if (checkinTodayId) {
            await updateDoc(doc(db, 'checkinToday', checkinTodayId), {
                status: 1,
                approveBy: payload.approveBy,
                approveByGoogleId: payload.approveByGoogleId,
            });
        }
        resolve('success');
    });
};
