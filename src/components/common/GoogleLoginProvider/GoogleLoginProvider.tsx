import axios from 'axios';
import { loadAuth2, loadGapiInsideDOM } from 'gapi-script';
import { createContext, useEffect, useState } from 'react';
import { Profile, SheetData } from 'type.global';

type GoogleLoginContextProps = {
    auth2: gapi.auth2.GoogleAuthBase | null;
    profile: Profile | null;
    isSignedIn: boolean;
    authLoading: boolean;
    onSignin: () => void;
    onSignout: () => void;
    getUserList: () => Promise<Profile[]>;
    updateUser: (auth2: gapi.auth2.GoogleAuthBase, profile: Profile, rowNumber: number) => Promise<any>;
};

export const GoogleLoginContext = createContext<GoogleLoginContextProps>({
    auth2: null,
    profile: null,
    isSignedIn: false,
    authLoading: true,
    onSignin: () => {},
    onSignout: () => {},
    getUserList: (() => {}) as GoogleLoginContextProps['getUserList'],
} as GoogleLoginContextProps);

function GoogleLoginProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<gapi.auth2.GoogleAuthBase | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    //

    const updateUser = async (auth2: gapi.auth2.GoogleAuthBase, profile: Profile, rowNumber: number) => {
        const googleUser = auth2.currentUser.get();
        const token = googleUser.getAuthResponse().access_token;
        const sheetsId = '1MXTH-zKqVIT6hl_RZodU2e9ChGAYEzO-K7uqUms9sRs';
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`;

        const requestBody = {
            valueInputOption: 'USER_ENTERED', // or "RAW"
            data: [
                {
                    range: `Member!A${rowNumber}`,
                    values: [[profile.role]],
                },
                {
                    range: `Member!B${rowNumber}`,
                    values: [[profile.googleId]],
                },
                {
                    range: `Member!C${rowNumber}`,
                    values: [[profile.email]],
                },
                {
                    range: `Member!D${rowNumber}`,
                    values: [[profile.fullName]],
                },
                {
                    range: `Member!E${rowNumber}`,
                    values: [[profile.name]],
                },
                {
                    range: `Member!F${rowNumber}`,
                    values: [[profile.phoneNumber]],
                },
                {
                    range: `Member!G${rowNumber}`,
                    values: [[profile.jobPosition]],
                },
                {
                    range: `Member!H${rowNumber}`,
                    values: [[profile.employmentType]],
                },
                {
                    range: `Member!I${rowNumber}`,
                    values: [[profile.profileURL]],
                },
            ],
        };

        const response = await axios(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(requestBody),
        });

        const result = await response.data;
        // console.log("result:", result);
        return result;
    };
    const getSetProfile = async (auth2: gapi.auth2.GoogleAuthBase) => {
        try {
            if (auth2.isSignedIn.get()) {
                const userList = await getUserList();
                const googleUser = auth2.currentUser.get();
                const profile = googleUser.getBasicProfile();
                const idToken = googleUser.getAuthResponse().id_token;
                const findUser = userList.find((f) => f.googleId === profile.getId());
                let _profile: Profile = {
                    googleId: profile.getId(),
                    token: idToken,
                    fullName: profile.getName(),
                    profileURL: profile.getImageUrl(),
                    email: profile.getEmail(),
                    role: 'USER',
                };
                if (findUser) {
                    setProfile({ ..._profile, ...findUser, token: _profile.token });
                } else {
                    const rowCanUpdate = userList.filter((f) => !f.googleId);

                    setProfile({ ..._profile });
                    updateUser(auth2, _profile, rowCanUpdate[0].sheetRowNumber ?? 0);
                }
            }

            auth2.isSignedIn.listen(setIsSignedIn);
            setIsSignedIn(auth2.isSignedIn.get());
        } catch (error) {
            console.error('error:', error);
        }

        setAuthLoading(false);
    };
    const onSignout = () => {
        if (auth) {
            auth.signOut();
            setIsSignedIn(auth.isSignedIn.get());
            setProfile(null);
        }
    };

    const onSignin = async () => {
        try {
            if (auth) {
                await auth.signIn();
                getSetProfile(auth);
            }
        } catch (error) {
            console.error('error:', error);
        }
    };

    const getUserList: GoogleLoginContextProps['getUserList'] = () => {
        const sheetsId = '1MXTH-zKqVIT6hl_RZodU2e9ChGAYEzO-K7uqUms9sRs';
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/Member?key=${process.env.REACT_APP_API_KEY}`;

        return axios
            .get<SheetData>(apiUrl)
            .then((response) => {
                const data = response.data.values;
                const maxLength = data[1].length;

                const normalizedData = data.map((row) => {
                    const rowCopy = [...row];
                    // Add empty strings for missing columns to match the first row length
                    while (rowCopy.length < maxLength) {
                        rowCopy.push('');
                    }
                    return rowCopy;
                });
                // console.log("normalizedData:", normalizedData);

                const arr: Profile[] = normalizedData.slice(1).map((data, index) => {
                    return {
                        role: data[0] as 'ADMIN' | 'STAFF' | 'USER',
                        googleId: data[1],
                        email: data[2],
                        fullName: data[3],
                        name: data[4],
                        phoneNumber: data[5],
                        jobPosition: data[6],
                        employmentType: data[7],
                        profileURL: data[8],
                        token: '',
                        sheetRowNumber: index + 2,
                    };
                });

                return arr;
            })
            .catch((err) => {
                console.error('err:', err);

                return [];
            });
    };

    const initClient = async () => {
        try {
            const gapi = await loadGapiInsideDOM();
            const auth2 = await loadAuth2(
                gapi,
                process.env.REACT_APP_GOOGLE_PRIVATE_KEY as string,
                'https://www.googleapis.com/auth/spreadsheets'
            );

            setAuth(auth2);
            getSetProfile(auth2);
        } catch (error) {
            console.error('error:', error);
        }
    };

    useEffect(() => {
        initClient();
    }, []);

    //
    return (
        <GoogleLoginContext.Provider
            value={{
                auth2: auth,
                profile: profile,
                isSignedIn: isSignedIn,
                authLoading: authLoading,
                onSignin: onSignin,
                onSignout: onSignout,
                getUserList: getUserList,
                updateUser: updateUser,
            }}
        >
            {children}
        </GoogleLoginContext.Provider>
    );
}

export default GoogleLoginProvider;
