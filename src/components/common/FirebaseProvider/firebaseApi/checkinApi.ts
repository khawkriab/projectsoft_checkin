import { db } from '../FirebaseProvider';
import { CheckinCalendar, UserCheckInData, UserCheckinList } from 'type.global';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
export const createCheckinCalendar = (payload: { date: string; userCheckinList: [] }[]) => {
    return new Promise<string>(async (resolve, reject) => {
        const all = payload.map((d) => addDoc(collection(db, 'checkinCalendar'), d));
        await Promise.all(all);

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
export const updateUserCheckin = (cId: string, uId: string, payload: UserCheckinList[]) => {
    return new Promise<{ date: string; userCheckinList: UserCheckinList[] }>(async (resolve, reject) => {
        try {
            await updateDoc(doc(db, 'checkinCalendar', cId), { userCheckinList: payload });
            if (uId) {
                await updateDoc(doc(db, 'checkinToday', uId), { status: 1 });
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
