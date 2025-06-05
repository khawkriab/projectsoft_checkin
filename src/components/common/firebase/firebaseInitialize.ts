// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// CheckinSheets
const firebaseConfig = {
    apiKey: 'AIzaSyAZYP-RFU3_xwR5VQ6U7URxbS-jse-5B_Y',
    authDomain: 'checkinsheets-452406.firebaseapp.com',
    projectId: 'checkinsheets-452406',
    storageBucket: 'checkinsheets-452406.firebasestorage.app',
    messagingSenderId: '484657894073',
    appId: '1:484657894073:web:692d7cc37b63ed77998168',
    measurementId: 'G-Q4WFCS95PN',
};
// checkin-calendar
// const firebaseConfig = {
//     apiKey: 'AIzaSyBlFyN9DlEMpjaP6dNHqRHkBeVIHiPMmZw',
//     authDomain: 'checkin-calendar-166b4.firebaseapp.com',
//     projectId: 'checkin-calendar-166b4',
//     storageBucket: 'checkin-calendar-166b4.firebasestorage.app',
//     messagingSenderId: '1078310633734',
//     appId: '1:1078310633734:web:b9afc87b7c67ff26a9de87',
//     measurementId: 'G-3FZDBXGWC4',
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export const db = getFirestore(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
export const signInWithGoogleGapi = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    console.log('Signed in Firebase as:', result.user.email);
};

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
// provider.addScope('https://www.googleapis.com/auth/spreadsheets');

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('✅ Logged in user:', user);
        return user;
    } catch (error) {
        console.error('❌ Google login failed:', error);
    }
};
export const logoutWithGoogle = async () => {
    signOut(auth)
        .then(() => {
            console.log('✅ User signed out');
        })
        .catch((error) => {
            console.error('❌ Sign-out error:', error);
        });
};
