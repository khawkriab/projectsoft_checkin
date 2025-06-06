import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Profile } from 'type.global';
import { db } from '../FirebaseProvider';

export const addUsersRegister = (payload: Profile) => {
    return new Promise<string>(async (resolve) => {
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
export const addUsersList = (payload: Profile) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!payload?.id) reject('no id');

        try {
            await setDoc(
                doc(db, 'usersList', payload.id ?? ''),
                {
                    googleId: payload.googleId,
                    fullName: payload.fullName,
                    profileURL: payload.profileURL ?? '',
                    email: payload.email,
                    role: payload.role,
                    name: payload.name,
                    phoneNumber: payload.phoneNumber,
                    jobPosition: payload.jobPosition,
                    employmentType: payload.employmentType,
                    allowFindLocation: 0,
                    status: 'APPROVE',
                },
                { merge: true }
            );
            // await deleteDoc(doc(db, 'usersRegister', payload.id ?? ''));

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};
