import { CheckinCalendar, FirebaseQuery, Profile, UserCheckInData, UserCheckinList } from 'type.global';
import { db, signInWithGoogleGapi } from '../firebaseInitialize';
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

type StandardResponse<T = any> = T & {
    id: string;
};

export const addUsersRegister = (googleToken: string, payload: Profile) => {
    return new Promise<string>(async (resolve) => {
        await signInWithGoogleGapi(googleToken);
        if (payload.id) {
            await setDoc(
                doc(db, 'usersList', payload.id ?? ''),
                {
                    email: payload.email,
                    employmentType: payload.employmentType,
                    fullName: payload.fullName,
                    googleId: payload.googleId,
                    jobPosition: payload.jobPosition,
                    name: payload.name,
                    phoneNumber: payload.phoneNumber,
                    profileURL: payload.profileURL,
                    role: payload.role,
                    status: 'WAITING',
                },
                { merge: true }
            );
        } else {
            await addDoc(collection(db, 'usersList'), {
                email: payload.email,
                employmentType: payload.employmentType,
                fullName: payload.fullName,
                googleId: payload.googleId,
                jobPosition: payload.jobPosition,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                profileURL: payload.profileURL,
                role: payload.role,
                status: 'WAITING',
            });
        }

        resolve('success');
    });
};
export const getUsersRegister = (email: string) => {
    return new Promise<Profile>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersList');
        const q = query(usersRef, where('email', '==', email));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Profile),
        }));

        if (matchedUsers.length > 0) {
            resolve(matchedUsers[0]);
        }

        reject('user not found');
    });
};
export const getUsersRegisterList = () => {
    return new Promise<Profile[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'usersRegister'));
        const usersData: Profile[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Profile),
            id: doc.id,
        }));

        resolve(usersData);
    });
};
export const getUsers = (googleId: string) => {
    return new Promise<Profile>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersList');
        const q = query(usersRef, where('googleId', '==', googleId));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Profile),
        }));

        if (matchedUsers.length > 0) {
            resolve(matchedUsers[0]);
        }

        reject('user not found');
    });
};
export const getUsersList = () => {
    return new Promise<Profile[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'usersList'));
        const usersData: Profile[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Profile),
            id: doc.id,
        }));

        resolve(usersData);
    });
};
export const addUsersList = (googleToken: string, payload: Profile) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!payload?.id) reject('no id');

        await signInWithGoogleGapi(googleToken);
        await setDoc(
            doc(db, 'usersList', payload.id ?? ''),
            {
                googleId: payload.googleId,
                fullName: payload.fullName,
                profileURL: payload.profileURL,
                email: payload.email,
                role: payload.role,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                jobPosition: payload.jobPosition,
                employmentType: payload.employmentType,
                status: 'APPROVE',
            },
            { merge: true }
        );
        // await deleteDoc(doc(db, 'usersRegister', payload.id ?? ''));

        resolve('success');
    });
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
export const addUserCheckinToday = (googleToken: string, payload: UserCheckInData) => {
    return new Promise<string>(async (resolve, reject) => {
        await signInWithGoogleGapi(googleToken);
        await addDoc(collection(db, 'checkinToday'), payload);

        resolve('success');
    });
};
export const createCheckinCalendar = (googleToken: string, payload: { date: string; userCheckinList: [] }[]) => {
    return new Promise<string>(async (resolve, reject) => {
        await signInWithGoogleGapi(googleToken);

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

        resolve(res);
    });
};
export const updateUserCheckin = (cId: string, uId: string, payload: UserCheckinList[]) => {
    return new Promise<{ date: string; userCheckinList: UserCheckinList[] }>(async (resolve, reject) => {
        const querySnapshot = await updateDoc(doc(db, 'checkinCalendar', cId), { userCheckinList: payload });
        await updateDoc(doc(db, 'checkinToday', uId), { status: 1 });
        console.log('querySnapshot:', querySnapshot);

        resolve({ date: 'string', userCheckinList: [] });
    });
};
