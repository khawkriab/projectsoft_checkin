import usePost from "./usePost";

function useFetcher() {
  const { apiPost, apiGet } = usePost();
  return {
    POST: apiPost,
    GET: apiGet,
  };
}

export default useFetcher;
