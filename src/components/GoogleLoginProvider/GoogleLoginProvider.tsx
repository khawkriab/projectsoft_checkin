import axios from "axios";
import { loadAuth2, loadGapiInsideDOM } from "gapi-script";
import { createContext, useEffect, useState } from "react";

type SheetData = {
  range: string;
  majorDimension: string;
  values: string[][];
};

type Profile = {
  id: string;
  token: string;
  fullName: string;
  profileURL: string;
  email: string;
  role: "ADMIN" | "STAFF" | "USER";
};

type GoogleLoginContextProps = {
  auth2: gapi.auth2.GoogleAuthBase | null;
  profile: Profile | null;
  isSignedIn: boolean;
  authLoading: boolean;
  onSignin: () => void;
  onSignout: () => void;
};

export const GoogleLoginContext = createContext<GoogleLoginContextProps>({
  auth2: null,
  profile: null,
  isSignedIn: false,
  authLoading: true,
  onSignin: () => {},
  onSignout: () => {},
});

function GoogleLoginProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<gapi.auth2.GoogleAuthBase | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  //

  const updateUser = async (
    auth2: gapi.auth2.GoogleAuthBase,
    profile: Profile,
    rowNumber: number
  ) => {
    const googleUser = auth2.currentUser.get();
    const token = googleUser.getAuthResponse().access_token;
    const sheetsId = "1MXTH-zKqVIT6hl_RZodU2e9ChGAYEzO-K7uqUms9sRs";
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`;

    const requestBody = {
      valueInputOption: "USER_ENTERED", // or "RAW"
      data: [
        {
          range: `Member!A${rowNumber}`,
          values: [[profile.id]],
        },
        {
          range: `Member!B${rowNumber}`,
          values: [[profile.email]],
        },
        {
          range: `Member!C${rowNumber}`,
          values: [[profile.fullName]],
        },
        {
          range: `Member!D${rowNumber}`,
          values: [[profile.profileURL]],
        },
        {
          range: `Member!E${rowNumber}`,
          values: [[profile.role]],
        },
      ],
    };

    const response = await axios(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(requestBody),
    });

    const result = await response.data;
    console.log("result:", result);
  };
  const getSetProfile = async (auth2: gapi.auth2.GoogleAuthBase) => {
    if (auth2.isSignedIn.get()) {
      const userList = await getUserList();
      const googleUser = auth2.currentUser.get();
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;
      const findUser = userList.find((f) => f.id === profile.getId());

      const _profile = {
        id: profile.getId(),
        token: idToken,
        fullName: profile.getName(),
        profileURL: profile.getImageUrl(),
        email: profile.getEmail(),
        role: findUser?.role ?? "USER",
      };
      setProfile({ ..._profile });

      if (!findUser) {
        const rowCanUpdate = userList.filter((f) => !f.id);
        updateUser(auth2, _profile, rowCanUpdate[0].rowNumber);
      }
    }

    auth2.isSignedIn.listen(setIsSignedIn);
    setIsSignedIn(auth2.isSignedIn.get());
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
    if (auth) {
      await auth.signIn();
      getSetProfile(auth);
    }
  };

  const getUserList = (): Promise<(Profile & { rowNumber: number })[]> => {
    const sheetsId = "1MXTH-zKqVIT6hl_RZodU2e9ChGAYEzO-K7uqUms9sRs";
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
            rowCopy.push("");
          }
          return rowCopy;
        });
        // console.log("normalizedData:", normalizedData);

        const arr: (Profile & { rowNumber: number })[] = normalizedData
          .slice(1)
          .map((data, index) => {
            return {
              id: data[0],
              email: data[1],
              fullName: data[2],
              profileURL: data[3],
              role: data[4] as "ADMIN" | "STAFF" | "USER",
              token: "",
              rowNumber: index + 2,
            };
          });

        return arr;
      })
      .catch((err) => {
        console.error("err:", err);

        return [];
      });
  };

  const initClient = async () => {
    const gapi = await loadGapiInsideDOM();
    const auth2 = await loadAuth2(
      gapi,
      process.env.REACT_APP_GOOGLE_PRIVATE_KEY as string,
      "https://www.googleapis.com/auth/spreadsheets"
    );

    setAuth(auth2);
    getSetProfile(auth2);

    // gapi.client
    //   .init({
    //     apiKey: process.env.REACT_APP_API_KEY,
    //     clientId: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
    //     discoveryDocs: [
    //       "https://sheets.googleapis.com/$discovery/rest?version=v4",
    //     ],
    //     scope: "https://www.googleapis.com/auth/spreadsheets",
    //   })
    //   .then(() => {
    //     getSetProfile();
    //   })
    //   .catch((error: any) => {
    //     console.error("Error initializing Google API client:", error);
    //   });
  };

  useEffect(() => {
    // gapi.load("client:auth2", initClient);
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
      }}
    >
      {children}
    </GoogleLoginContext.Provider>
  );
}

export default GoogleLoginProvider;
