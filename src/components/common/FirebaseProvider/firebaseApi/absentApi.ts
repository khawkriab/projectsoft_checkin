import { db } from '../FirebaseProvider';
import { AbsentData, AbsentStatus, BaseData, FirebaseQuery } from 'type.global';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const createAbsent = (payload: AbsentData) => {
    return new Promise<string>(async (resolve, reject) => {
        await addDoc(collection(db, 'absentList'), {
            name: payload.name,
            email: payload.email,
            googleId: payload.googleId,
            leaveType: payload.leaveType,
            leavePeriod: payload.leavePeriod,
            startDate: payload.startDate,
            endDate: payload.endDate,
            reason: payload.reason,
            status: payload.status,
            approveBy: payload.approveBy,
            approveByGoogleId: payload.approveByGoogleId,
            createdAt: dayjs().toISOString(),
            updateAt: dayjs().toISOString(),
        });

        resolve('success');
    });
};

export const getAbsentList = (status: AbsentStatus = 'WAITING') => {
    return new Promise<(FirebaseQuery & AbsentData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'absentList');
        const q = query(usersRef, where('status', '==', status));

        const querySnapshot = await getDocs(q);

        const r = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as AbsentData),
        }));

        resolve([...r]);
    });
};
export const getUserAbsent = (googleId: string) => {
    return new Promise<(FirebaseQuery & AbsentData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'absentList');
        const q = query(usersRef, where('googleId', '==', googleId));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as AbsentData),
        }));

        if (matchedUsers.length > 0) {
            resolve([...matchedUsers]);
        } else {
            reject('not found data');
        }
    });
};

export const updateAbsent = (abId: string, payload: { status: AbsentStatus; approveBy: string; approveByGoogleId: string }) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(
            doc(db, 'absentList', abId),
            {
                status: payload.status,
                approveBy: payload.approveBy,
                approveByGoogleId: payload.approveByGoogleId,
                updateAt: dayjs().toISOString(),
            },
            { merge: true }
        );

        resolve('success');
    });
};
