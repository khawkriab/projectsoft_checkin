import { addDoc, and, collection, deleteDoc, doc, getDocs, or, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { Profile } from 'type.global';
import { db } from '../FirebaseProvider';
import dayjs from 'dayjs';

export const addUsersRegister = (payload: Profile) => {
    return new Promise<string>(async (resolve) => {
        if (payload?.id) {
            await setDoc(doc(db, 'usersList', payload.id), {
                email: payload.email,
                employmentType: payload.employmentType,
                fullName: payload.fullName,
                googleId: payload.googleId,
                jobPosition: payload.jobPosition,
                name: payload.name,
                phoneNumber: payload.phoneNumber,
                profileURL: payload.profileURL,
                role: payload.role,
                allowFindLocation: payload?.allowFindLocation || 0,
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
        await updateDoc(doc(db, 'usersList', uId), {
            allowFindLocation: allowFindLocation,
        });

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
    return new Promise<Profile | null>(async (resolve, reject) => {
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

        resolve(null);
    });
};
export const getUsersList = () => {
    return new Promise<Profile[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'usersList'));

        const usersData: Profile[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Profile),
            id: doc.id,
        }));

        resolve(usersData.sort((a, b) => a.name?.toLowerCase().localeCompare(b.name?.toLowerCase())));
    });
};

// today format '2024-06-01'
export const getUsersListWithMonth = ({ today }: { today: string }) => {
    return new Promise<Profile[]>(async (resolve, reject) => {
        const q = query(
            collection(db, 'usersList'),
            or(
                and(where('status', '==', 'APPROVE'), where('employmentStartDate', '<=', today)),
                and(where('status', '==', 'INACTIVE'), where('employmentStartDate', '<=', today), where('employmentEndDate', '>=', today))
            )
        );

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        //  const usersRef = collection(db, 'usersList');
        // const q1 = query(collection(db, 'usersList'), where('status', '==', 'APPROVE'), where('employmentStartDate', '<=', today));
        // const q1 = query(
        //     collection(db, 'usersList'),
        //     where('employmentEndDate', '>=', '2025-06-01'),
        //     where('employmentStartDate', '<=', today)
        // );

        // Query for INACTIVE
        // const q2 = query(
        //     collection(db, 'usersList'),
        //     where('status', '==', 'INACTIVE'),
        //     where('employmentStartDate', '<=', today),
        //     where('employmentEndDate', '>=', today)
        // );

        // const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        // const [snap1] = await Promise.all([getDocs(q1)]);
        // const results = [...snap1.docs, ...snap2.docs].map((doc) => ({ id: doc.id, ...doc.data() }));
        // const results = [...snap1.docs].map((doc) => ({ id: doc.id, ...doc.data() }));

        resolve(results as Profile[]);
    });
};
export const updateUser = (uId: string, payload: Profile) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!uId) reject('no id');

        try {
            await setDoc(doc(db, 'usersList', uId), {
                ...payload,
                allowFindLocation: payload?.allowFindLocation || 0,
                profileURL: payload.profileURL ?? '',
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
