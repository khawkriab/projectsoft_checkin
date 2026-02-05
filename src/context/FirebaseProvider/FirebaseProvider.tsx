import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { LeaveData, Profile } from 'type.global';
import { createUsersRegister, getAnnualLeaveEntitlement, getUsersRegisterWithEmail, getUsersWithEmail } from './firebaseApi/userApi';
import { useNotification } from 'components/common/NotificationCenter';
import dayjs from 'dayjs';
import { summarizeUserLeave } from 'utils/summarizeUserLeave';
import { getUserLeave } from './firebaseApi/leaveApi';

interface FirebaseContextType {
    profile: Profile | null;
    isSignedIn: boolean;
    authLoading: boolean;
    leaveList: LeaveData[];
    summaryLeaveDays: {
        all: {
            personal: number;
            sick: number;
            vacation: number;
        };
        used: {
            personal: number;
            sick: number;
            vacation: number;
        };
    };
    updateUserInfo: (email: string) => Promise<Profile | undefined>;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
    onRegister: () => Promise<void>;
}

// Firebase config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STOREAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// Auth provider
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
    return context;
};

function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const { openNotify } = useNotification();
    const cancelGetInfo = useRef(false);
    //
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [leaveList, setLeaveList] = useState<LeaveData[]>([]);
    const [summaryLeaveDays, setSummaryLeaveDays] = useState({
        all: { personal: 0, sick: 0, vacation: 0 },
        used: { personal: 0, sick: 0, vacation: 0 },
    });

    //
    const getUserAnnualLeaveEntitlement = async (suid: string) => {
        try {
            const leaveList = await getUserLeave(suid, dayjs().get('year'));
            setLeaveList([...leaveList]);

            const res = await getAnnualLeaveEntitlement(suid);
            const used = summarizeUserLeave(leaveList.filter(f=>f.status === 'APPROVE'));
            const all = res.annualLeaveEntitlement.find((f) => f.years === dayjs().get('year'));

            setSummaryLeaveDays((prev) => ({
                ...prev,
                all: {
                    personal: all?.personal || 0,
                    sick: all?.sick || 0,
                    vacation: all?.vacation || 0,
                },
                used: used,
            }));
        } catch (error) {
            console.error('error:', error);
        }
    };

    const onRegister = async () => {
        try {
            const c = auth.currentUser;
            const payload: Profile = {
                role: 'USER',
                name: c?.displayName || '',
                jobPosition: '',
                email: c?.email || '',
                status: 'WAITING',
                employmentEndDate: '',
                fullName: '',
                employmentStartDate: '',
                phoneNumber: '',
                suid: '',
                employmentType: '',
                profileURL: '',
                googleUid: c?.uid,
            };

            if (!c?.uid) return openNotify('error', 'No Id');

            await createUsersRegister(c.uid, payload);

            openNotify('success', 'Waiting for approve');
        } catch (error) {
            console.error('error:', error);
        }
    };

    const signInWithGoogle = async () => {
        cancelGetInfo.current = true;
        try {
            const user = await signInWithPopup(auth, provider);

            const profile = await getUserInfo(user.user.email || '', true);

            if (profile) {
                if (profile.role === 'ORGANIZATION') {
                    window.location.assign('/projectsoft_checkin/#/manage');
                } else {
                    window.location.assign('/projectsoft_checkin');
                }
            }
        } catch (error) {
            console.error('Google login failed:', error);
        }
        cancelGetInfo.current = false;
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
            window.location.assign('/projectsoft_checkin');
            console.log('User signed out');
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    };

    const getUserInfo = async (email: string, onlyGet?: boolean) => {
        try {
            const uid = auth.currentUser?.uid;
            const res = await getUsersWithEmail(email, uid || '');

            if (!onlyGet) setIsSignedIn(true);
            if (res) {
                await getUserAnnualLeaveEntitlement(res.suid);

                if (!onlyGet) setProfile({ ...res });

                return res;
            } else {
                const u = await getUsersRegisterWithEmail(email, uid || '');

                if (u) {
                    openNotify('warning', 'Waiting for approve');
                } else {
                    openNotify('error', 'Not found user');
                }
            }
        } catch (error) {
            console.error('error:', error);
            // setProfile({ ...profile });
            openNotify('error', 'Not found user');
        }
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {
                if (currentUser) {
                    console.log('currentUser:', currentUser);
                    if (!currentUser.email) {
                        setIsSignedIn(false);
                        return;
                    }

                    if (cancelGetInfo.current) return;

                    await getUserInfo(currentUser.email);
                } else {
                    console.warn('User token expired or signed out');
                    setIsSignedIn(false);
                }
                setAuthLoading(false);
            },
            (err) => {
                console.error('err:', err);
                setAuthLoading(false);
            }
        );

        // Cleanup listener
        return () => unsubscribe();
    }, [cancelGetInfo.current]);

    return (
        <FirebaseContext.Provider
            value={{
                profile: profile,
                isSignedIn: isSignedIn,
                authLoading: authLoading,
                leaveList: leaveList,
                summaryLeaveDays: summaryLeaveDays,
                signInWithGoogle,
                signOutUser,
                updateUserInfo: getUserInfo,
                onRegister: onRegister,
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;
