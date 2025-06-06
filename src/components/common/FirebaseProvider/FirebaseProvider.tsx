import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from 'type.global';
import { getUsersWithEmail } from './firebaseApi/userApi';

interface FirebaseContextType {
    profile: Profile | null;
    isSignedIn: boolean;
    authLoading: boolean;
    updateUserInfo: (profile: Profile) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
}

// Firebase config
console.log('process.env.REACT_APP_API_KEY:', process.env.REACT_APP_API_KEY);
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
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);

    //
    const signInWithGoogle = async () => {
        try {
            const user = await signInWithPopup(auth, provider);
            console.log('Logged in user:', user);
        } catch (error) {
            console.error('Google login failed:', error);
        }
    };

    const signOutUser = async () => {
        try {
            await signOut(auth);
            console.log('User signed out');
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    };

    const updateUserInfo = async (profile: Profile) => {
        try {
            const res = await getUsersWithEmail(profile.email);
            setProfile({
                ...profile,
                ...res,
                googleId: res.googleId || profile.googleId,
                fullName: res.fullName || profile.fullName,
                profileURL: res.profileURL || profile.profileURL,
                email: res.email || profile.email,
            });
        } catch (error) {
            console.error('error:', error);
            setProfile({ ...profile });
        }
    };

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                console.log('currentUser:', currentUser);
                let _profile: Profile = {
                    googleId: currentUser.providerData[0]?.uid,
                    fullName: currentUser.displayName ?? '',
                    profileURL: currentUser.photoURL ?? '',
                    email: currentUser.email ?? '',
                    role: 'USER',
                    status: 'NO_REGIST',
                };

                await updateUserInfo(_profile);

                setIsSignedIn(true);
            } else {
                setIsSignedIn(false);
            }
            setAuthLoading(false);
        });

        // Cleanup listener
        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider
            value={{
                profile: profile,
                isSignedIn: isSignedIn,
                authLoading: authLoading,
                signInWithGoogle,
                signOutUser,
                updateUserInfo,
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;
