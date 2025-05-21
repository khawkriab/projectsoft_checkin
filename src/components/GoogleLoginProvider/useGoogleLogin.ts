import { useContext } from "react";
import { GoogleLoginContext } from "./GoogleLoginProvider";

function useGoogleLogin() {
  const context = useContext(GoogleLoginContext);
  return context;
}

export default useGoogleLogin;
