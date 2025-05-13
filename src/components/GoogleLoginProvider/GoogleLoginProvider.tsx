import { gapi } from "gapi-script";
import { createContext, useEffect, useState } from "react";

type ProfileData = {
  id: string;
  token: string;
  fullName: string;
  profileURL: string;
  email: string;
};

type GoogleLoginContextProps = {
  profile: ProfileData | null;
  onLoginGoogle: () => void;
  onLogoutGoogle: () => void;
  signinStatus: boolean;
  authLoaded: boolean;
  roleId: number | null;
  setRoleId: (id: number) => void;
};

type GoogleLoninProviderProps = {
  children: React.ReactNode;
};

const GoogleLoginContext = createContext<GoogleLoginContextProps>({
  profile: null,
  onLoginGoogle: () => {},
  onLogoutGoogle: () => {},
  signinStatus: false,
  authLoaded: false,
  roleId: null,
  setRoleId: () => {},
});

function GoogleLoninProvider({ children }: GoogleLoninProviderProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [roleId, setRoleId] = useState<number | null>(null);

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
    setProfile(null);
    setRoleId(null);
  };

  const handleSignIn = () => {
    gapi.auth2
      .getAuthInstance()
      .signIn()
      .then((user: any) => {
        const profile = user.getBasicProfile();
        const idToken = user.getAuthResponse().id_token;

        setProfile({
          id: profile.getId(),
          token: idToken,
          fullName: profile.getName(),
          profileURL: profile.getImageUrl(),
          email: profile.getEmail(),
        });
      })
      .catch(() => {
        alert("Sign-in error");
      });
  };

  const initClient = () => {
    const clientId =
      "617287579060-66r4kae3sergkb7bv933ipkekpg1l8a6.apps.googleusercontent.com";
    const apiKey = "AIzaSyC5wYRXYMuUGQGchOqgtreNx2y3bf2eTic";

    gapi.client
      .init({
        apiKey,
        clientId,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: "https://www.googleapis.com/auth/spreadsheets",
      })
      .then(() => {
        const authInstance = gapi.auth2.getAuthInstance();

        if (authInstance.isSignedIn.get()) {
          const googleUser = authInstance.currentUser.get();
          const profile = googleUser.getBasicProfile();
          const idToken = googleUser.getAuthResponse().id_token;

          setProfile({
            id: profile.getId(),
            token: idToken,
            fullName: profile.getName(),
            profileURL: profile.getImageUrl(),
            email: profile.getEmail(),
          });
        }

        setIsSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsSignedIn);
        setAuthLoaded(true);
      })
      .catch((error: any) => {
        console.error("Error initializing Google API client:", error);
      });
  };

  useEffect(() => {
    gapi.load("client:auth2", initClient);
  }, []);

  return (
    <GoogleLoginContext.Provider
      value={{
        profile,
        onLoginGoogle: handleSignIn,
        onLogoutGoogle: handleSignOut,
        signinStatus: isSignedIn,
        authLoaded,
        roleId,
        setRoleId, // ✅ ให้ Provider ใช้งานได้
      }}
    >
      {children}
    </GoogleLoginContext.Provider>
  );
}

export default GoogleLoninProvider;
export { GoogleLoginContext };
