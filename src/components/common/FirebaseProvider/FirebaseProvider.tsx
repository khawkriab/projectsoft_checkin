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
    signInWithGoogle: () => Promise<void>;
    signOutUser: () => Promise<void>;
}

// Firebase config
const firebaseConfig = {
    apiKey: 'AIzaSyBlFyN9DlEMpjaP6dNHqRHkBeVIHiPMmZw',
    authDomain: 'checkin-calendar-166b4.firebaseapp.com',
    projectId: 'checkin-calendar-166b4',
    storageBucket: 'checkin-calendar-166b4.firebasestorage.app',
    messagingSenderId: '1078310633734',
    appId: '1:1078310633734:web:b9afc87b7c67ff26a9de87',
    measurementId: 'G-3FZDBXGWC4',
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

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                console.log('currentUser:', currentUser);
                let _profile: Profile = {
                    googleId: currentUser.providerData[0]?.uid,
                    token: '',
                    fullName: currentUser.displayName ?? '',
                    profileURL: currentUser.photoURL ?? '',
                    email: currentUser.email ?? '',
                    role: 'USER',
                    status: 'NO_REGIST',
                };
                getUsersWithEmail(_profile.email)
                    .then((t) => {
                        setProfile({
                            ..._profile,
                            ...t,
                            googleId: t.googleId || _profile.googleId,
                            fullName: t.fullName || _profile.fullName,
                            profileURL: t.profileURL || _profile.profileURL,
                            email: t.email || _profile.email,
                            token: _profile.token,
                        });
                    })
                    .catch((error) => {
                        console.error('error:', error);
                        setProfile({ ..._profile });
                    });

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
            }}
        >
            {children}
        </FirebaseContext.Provider>
    );
}

export default FirebaseProvider;
