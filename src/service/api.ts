

export const POST = <T = any>(
  url: string,
  obj: any,
  options?: { headers?: Record<string, string> }
) => {
  return new Promise<T>((resolve, reject) => {
    //https://8845-49-48-146-81.ngrok-free.app
    //http://192.168.31.165:8000
    fetch("https://8845-49-48-146-81.ngrok-free.app" + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...(tokenId ? { "user-id-token": tokenId } : {}),
        // ...(tokenId ? { "user-id-token": "106105604740228840910" } : {}),
        
        ...options?.headers,
      }, 
      body: JSON.stringify(obj), 
    })
      .then(async (response) => {
        const data = await response.json();
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};


export const GET = <T=any>(url:string , options?:{headers?:Record <string,string>}) => {
    return new Promise<T> ((resolve , reject) => {
        fetch(
            "https://8845-49-48-146-81.ngrok-free.app"+ url,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...options?.headers
              },
            }
          ).then(
            async (response) => {
                const data = await response.json();
                resolve(data)
            }
          ).catch(
             (error) => {
                reject(error);
            }
          )
    })
}

export const CHECKIN = "/checkin/add"