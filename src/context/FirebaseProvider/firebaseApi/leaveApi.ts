import { db } from '../FirebaseProvider';
import { LeaveData, LeaveStatus, FirebaseQuery } from 'type.global';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const createLeave = (payload: LeaveData) => {
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

export const getLeaveList = (status: LeaveStatus = 'WAITING') => {
    return new Promise<(FirebaseQuery & LeaveData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'absentList');
        const q = query(usersRef, where('status', '==', status));

        const querySnapshot = await getDocs(q);

        const r = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as LeaveData),
        }));

        resolve([...r]);
    });
};
export const getUserLeave = (googleId: string) => {
    return new Promise<(FirebaseQuery & LeaveData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'absentList');
        const q = query(usersRef, where('googleId', '==', googleId));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as LeaveData),
        }));

        if (matchedUsers.length > 0) {
            resolve([...matchedUsers]);
        } else {
            reject('not found data');
        }
    });
};
// startDate format 'YYYY-MM-DD'
export const getUserLeaveByGoogleIdAndDate = (googleId: string, startDate: string) => {
    return new Promise<FirebaseQuery & LeaveData>(async (resolve, reject) => {
        const usersRef = collection(db, 'absentList');
        const q = query(usersRef, where('googleId', '==', googleId), where('startDate', '==', startDate));

        const querySnapshot = await getDocs(q);

        const matchedUsers = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as LeaveData),
        }));

        if (matchedUsers.length > 0) {
            resolve(matchedUsers[0]);
        } else {
            reject('not found data');
        }
    });
};

export const updateLeave = (abId: string, payload: { status: LeaveStatus; approveBy: string; approveByGoogleId: string }) => {
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
