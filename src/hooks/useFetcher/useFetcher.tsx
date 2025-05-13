import usePost from "./usePost";

function useFetcher() {
  const apiPost = usePost();
  return { POST: apiPost };
}

export default useFetcher;
