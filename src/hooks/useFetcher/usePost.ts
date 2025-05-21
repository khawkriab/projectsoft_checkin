import { useGoogleLogin } from "components/GoogleLoginProvider";
import { deviceDetect } from "react-device-detect";

function useApi() {
  const { profile } = useGoogleLogin();

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
        "User-Device": JSON.stringify(deviceDetect(undefined)),
        ...(profile?.token ? { "user-id-token": profile.token } : {}),
        ...options?.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("POST request failed");
    }

    return await response.json();
  };

  const apiGet = async <T = any>(
    url: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> => {
    const response = await fetch("http://192.168.31.165:8000" + url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Device": JSON.stringify(deviceDetect(undefined)),
        ...(profile?.token ? { "user-id-token": profile.token } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error("GET request failed");
    }

    return await response.json();
  };

  return { apiPost, apiGet };
}

export default useApi;
