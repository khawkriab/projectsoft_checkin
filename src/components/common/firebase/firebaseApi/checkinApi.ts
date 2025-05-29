import { Profile, UserCheckInData } from 'type.global';
import { db, signInWithGoogleGapi } from '../firebaseInitialize';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

export const addUsersRegister = (googleToken: string, payload: Profile) => {
    return new Promise<string>(async (resolve) => {
        await signInWithGoogleGapi(googleToken);
        await addDoc(collection(db, 'usersRegister'), payload);

        resolve('success');
    });
};
export const getUsersRegister = (googleId: string) => {
    return new Promise<Profile>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersRegister');
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
        await addDoc(collection(db, 'usersList'), {
            googleId: payload.googleId,
            fullName: payload.fullName,
            profileURL: payload.profileURL,
            email: payload.email,
            role: payload.role,
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            jobPosition: payload.jobPosition,
            employmentType: payload.employmentType,
        });
        await deleteDoc(doc(db, 'usersRegister', payload.id ?? ''));

        resolve('success');
    });
};

export const getCheckinToday = (googleId: string) => {
    return new Promise<UserCheckInData>(async (resolve, reject) => {
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
    return new Promise<{ date: string; userCheckinList: [] }[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'checkinCalendar'));
        const res: { date: string; userCheckinList: [] }[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as { date: string; userCheckinList: [] }),
            id: doc.id,
        }));

        resolve(res);
    });
};
