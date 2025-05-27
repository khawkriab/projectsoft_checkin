import { db } from '../firebaseInitialize';
import { collection, addDoc, setDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';

async function checkinFb() {
    console.log('checkinFb');
    const citiesRef = collection(db, 'cities');

    await setDoc(doc(citiesRef, 'SF'), {
        name: 'San Francisco',
        state: 'CA',
        country: 'USA',
        capital: false,
        population: 860000,
        regions: ['west_coast', 'norcal'],
    });
    await setDoc(doc(citiesRef, 'LA'), {
        name: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        capital: false,
        population: 3900000,
        regions: ['west_coast', 'socal'],
    });
    await setDoc(doc(citiesRef, 'DC'), {
        name: 'Washington, D.C.',
        state: null,
        country: 'USA',
        capital: true,
        population: 680000,
        regions: ['east_coast'],
    });
    await setDoc(doc(citiesRef, 'TOK'), {
        name: 'Tokyo',
        state: null,
        country: 'Japan',
        capital: true,
        population: 9000000,
        regions: ['kanto', 'honshu'],
    });
    await setDoc(doc(citiesRef, 'BJ'), {
        name: 'Beijing',
        state: null,
        country: 'China',
        capital: true,
        population: 21500000,
        regions: ['jingjinji', 'hebei'],
    });
    // await setDoc(doc(db, 'test'), {
    //     message: 'asd',
    // });
    // Add a new document in collection "cities"
    // await setDoc(doc(db, 'cities', 'LA'), {
    //     name: 'Los Angeles',
    //     state: 'CA',
    //     country: 'USA',
    // });
    // const docRef = doc(db, 'project_checkin', 'checkin_time');
    // const docSnap = await getDoc(docRef);

    // if (docSnap.exists()) {
    //     console.log('Document data:', docSnap.data());
    // } else {
    //     // docSnap.data() will be undefined in this case
    //     console.log('No such document!');
    // }
    // try {
    //     const unsubscribe = onSnapshot(
    //         collection(db, 'project_checkin'),
    //         (snapshot) => {
    //             snapshot.forEach((d) => console.log(d));
    //         },
    //         (error) => {
    //             console.error('Firestore listen error:', error);
    //         }
    //     );
    // } catch (err) {
    //     console.error('Outer error:', err);
    // }
}
// async function checkinFb() {
//     await addDoc(collection(db, 'checkinTime'), {
//         googleId: '123',
//         checkinTime: 111111111,
//         remark: 'test',
//         reason: 'test',
//         device: '{}',
//         location: [0, 0],
//         status: 99,
//     });
// }

export default checkinFb;
