import { useGoogleLogin } from "components/GoogleLoginProvider";
import {

  deviceDetect,

} from "react-device-detect";
function usePost() {
  const { profile } = useGoogleLogin();
  //console.log('profile:', profile?.token)

  const getPublicIP = async (): Promise<string> => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      return data.ip;
    } catch (err) {
      console.error("Failed to fetch IP:", err);
      return "unknown";
    }
  };

  const apiPost = async <T = any>(
    url: string,
    obj: any,
    options?: { headers?: Record<string, string> }
  ): Promise<T> => {
    const ip = await getPublicIP();

    const payload = {
      ...obj,
      //ip,
    };

    const response = await fetch("http://192.168.31.165:8000" + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Device" : JSON.stringify(deviceDetect(undefined)),
        ...(profile?.token ? { "user-id-token": profile.token } : {}),
        
        ...options?.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return await response.json();
  };

  return apiPost;
}

export default usePost;
