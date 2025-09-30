import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../FirebaseProvider';

export const getConfig = () => {
    return new Promise<any>(async (resolve, reject) => {
        const querySnapshot = await getDocs(collection(db, 'systemConfig'));

        // const usersData: Profile[] = querySnapshot.docs.map((doc) => ({
        //     ...(doc.data() as Profile),
        //     id: doc.id,
        // }));
    });
};
