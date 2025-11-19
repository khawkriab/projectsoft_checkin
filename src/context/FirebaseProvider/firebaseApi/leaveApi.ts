import { db } from '../FirebaseProvider';
import { LeaveData, LeaveStatus, FirebaseQuery } from 'type.global';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const createLeave = (payload: LeaveData) => {
    return new Promise<string>(async (resolve, reject) => {
        await addDoc(collection(db, 'leaveList'), {
            name: payload.name,
            email: payload.email,
            suid: payload.suid,
            leaveType: payload.leaveType,
            leavePeriod: payload.leavePeriod,
            startDate: payload.startDate,
            endDate: payload.endDate,
            reason: payload.reason,
            status: payload.status,
            approveBy: payload.approveBy,
            approveBySuid: payload.approveBySuid,
            createdAt: dayjs().toISOString(),
            updateAt: dayjs().toISOString(),
        });

        resolve('success');
    });
};

export const getLeaveList = (status?: LeaveStatus) => {
    return new Promise<(FirebaseQuery & LeaveData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'leaveList');
        let q = query(usersRef);

        if (status) {
            q = query(usersRef, where('status', '==', status));
        }

        const querySnapshot = await getDocs(q);

        const r = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as LeaveData),
        }));

        resolve([...r]);
    });
};
export const getUserLeave = (suid: string) => {
    return new Promise<(FirebaseQuery & LeaveData)[]>(async (resolve, reject) => {
        const usersRef = collection(db, 'leaveList');
        const q = query(usersRef, where('suid', '==', suid));

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
export const getUserLeaveBySuidAndDate = (suid: string, startDate: string) => {
    return new Promise<FirebaseQuery & LeaveData>(async (resolve, reject) => {
        const usersRef = collection(db, 'leaveList');
        const q = query(usersRef, where('suid', '==', suid), where('startDate', '==', startDate));

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

export const updateLeave = (abId: string, payload: { status: LeaveStatus; approveBy: string; approveBySuid: string }) => {
    return new Promise<string>(async (resolve, reject) => {
        await setDoc(
            doc(db, 'leaveList', abId),
            {
                status: payload.status,
                approveBy: payload.approveBy,
                approveBySuid: payload.approveBySuid,
                updateAt: dayjs().toISOString(),
            },
            { merge: true }
        );

        resolve('success');
    });
};
