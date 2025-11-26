import { addDoc, and, collection, deleteDoc, doc, getDocs, or, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { AnnualLeaveEntitlement, Profile } from 'type.global';
import { db } from '../FirebaseProvider';
import dayjs from 'dayjs';

export const addUsersRegister = (suid: string, payload: Profile) => {
    return new Promise<string>(async (resolve) => {
        if (suid) {
            // await setDoc(doc(db, 'usersList', payload.id), {
            //     email: payload.email,
            //     employmentType: payload.employmentType,
            //     fullName: payload.fullName,
            //     googleUid: payload.googleUid,
            //     suid: payload.suid,
            //     jobPosition: payload.jobPosition,
            //     name: payload.name,
            //     phoneNumber: payload.phoneNumber,
            //     profileURL: payload.profileURL,
            //     role: payload.role,
            //     status: 'WAITING',
            //     createdAt: payload?.createdAt || dayjs().toISOString(),
            //     updatedAt: dayjs().toISOString(),
            // });
            await setDoc(doc(db, 'usersList', suid), {
                ...payload,
                updatedAt: dayjs().toISOString(),
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
export const getUsersRegister = (suid: string) => {
    return new Promise<Profile>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersList');
        const q = query(usersRef, where('suid', '==', suid));

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
export const createUsersRegister = (googleUid: string, payload: Profile) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(doc(db, 'usersRegisterList', googleUid), {
            ...payload,
            updatedAt: dayjs().toISOString(),
        });

        resolve('success');
    });
};
export const getUsersRegisterWithEmail = (email: string, googleUid: string) => {
    return new Promise<Profile | null>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersRegisterList');
        const q = query(usersRef, where('email', '==', email), where('googleUid', '==', googleUid));

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
export const getUsersRegisterList = () => {
    return new Promise<Profile[]>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'usersRegisterList'));
        const usersData: Profile[] = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as Profile),
            id: doc.id,
        }));

        resolve(usersData);
    });
};
export const getUsers = (suid: string) => {
    return new Promise<Profile>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersList');
        const q = query(usersRef, where('suid', '==', suid));

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
export const getUsersWithEmail = (email: string, googleUid: string) => {
    return new Promise<Profile | null>(async (resolve, reject) => {
        const usersRef = collection(db, 'usersList');
        const q = query(usersRef, where('email', '==', email), where('googleUid', '==', googleUid));

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

        resolve(results as Profile[]);
    });
};
export const updateUser = (suid: string, payload: Partial<Profile>) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!suid) reject('no id');

        try {
            await updateDoc(doc(db, 'usersList', suid), {
                ...payload,
                updatedAt: dayjs().toISOString(),
            });

            if (payload.googleUid) {
                await deleteDoc(doc(db, 'usersRegisterList', payload.googleUid ?? ''));
            }

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteUser = (suid: string) => {
    return new Promise<string>(async (resolve, reject) => {
        if (!suid) reject('no id');

        try {
            await deleteDoc(doc(db, 'usersList', suid));

            resolve('success');
        } catch (error) {
            reject(error);
        }
    });
};

export const updateAnnualLeaveEntitlement = (suid: string, year: number, payload: AnnualLeaveEntitlement) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(doc(db, 'usersList', suid, 'annualLeaveEntitlement', String(year)), payload);

        resolve('success');
    });
};

export const getAnnualLeaveEntitlement = (suid: string) => {
    return new Promise<{ suid: string; annualLeaveEntitlement: AnnualLeaveEntitlement[] }>(async (resolve, reject) => {
        const snapshot = await getDocs(collection(db, 'usersList', suid, 'annualLeaveEntitlement'));

        const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as AnnualLeaveEntitlement),
        }));
        resolve({
            suid: suid,
            annualLeaveEntitlement: results,
        });
    });
};
