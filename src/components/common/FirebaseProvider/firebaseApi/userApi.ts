import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Profile } from 'type.global';
import { db } from '../FirebaseProvider';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';

export const addUsersRegister = (payload: Profile) => {
    return new Promise<string>(async (resolve) => {
        const auth = getAuth();
        // Wait for user to sign in first
        const user = auth.currentUser;

        if (user) {
            console.log('user.ui:', user.uid);
            const userRef = doc(db, 'usersList', user.uid);
            await setDoc(userRef, {
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
                createdAt: payload?.createdAt || dayjs().toISOString(),
                updateAt: dayjs().toISOString(),
            });
        }
        // }

        resolve('success');
    });
};
export const usersUpdateAllowLocation = (uId: string, allowFindLocation: number) => {
    return new Promise<string>(async (resolve) => {
        await setDoc(
            doc(db, 'usersList', uId),
            {
                allowFindLocation: allowFindLocation,
            },
            { merge: true }
        );

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
        } else {
            reject('user not found');
        }
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
export const getUsersWithEmail = (email: string) => {
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
export const updateUser = (uId: string, payload: Profile) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!uId) reject('no id');

        try {
            await setDoc(doc(db, 'usersList', uId), {
                googleId: payload.googleId,
                fullName: payload.fullName,
                profileURL: payload.profileURL ?? '',
                email: payload.email,
                role: payload.role,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                jobPosition: payload.jobPosition,
                employmentType: payload.employmentType,
                allowFindLocation: payload?.allowFindLocation || 0,
                status: payload.status,
                updateAt: dayjs().toISOString(),
            });
            // await deleteDoc(doc(db, 'usersRegister', payload.id ?? ''));

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};
export const deleteUser = (uId: string) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!uId) reject('no id');

        try {
            await deleteDoc(doc(db, 'usersList', uId));

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};
