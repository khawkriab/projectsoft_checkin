// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyAj5fX5hliwtrFQcpdQ1RYUoyT_SRKUiYk',
    authDomain: 'checkinsheets-452406.firebaseapp.com',
    projectId: 'checkinsheets-452406',
    storageBucket: 'checkinsheets-452406.firebasestorage.app',
    messagingSenderId: '484657894073',
    appId: '1:484657894073:web:692d7cc37b63ed77998168',
    measurementId: 'G-Q4WFCS95PN',
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export const db = getFirestore(app);
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
