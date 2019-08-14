import { useEffect, useState } from 'react';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface UseAPIRequest<T> {
  data: T;
  loading: boolean;
  lastUpdated: number;
  error?: Linode.ApiFieldError[];
}

/**
 *
 * useAPIRequest()
 *
 * Hook that executes a given request function and appropriately sets
 * `data`, `loading`, `lastUpdated`, and `error`.
 *
 * Defaults to making the request on first render. This is controlled
 * with the `deps` argument.
 *
 * EXAMPLE USAGE:
 *
 * const { data, loading, lastUpdated, error } = useAPIData<Linode.Account>(
 *  getAccountInfo
 * );
 *
 * @param request The request function to execute when `deps` change.
 * @param defaultData Value to use for `data` before request is made.
 * @param deps The dependencies this hook relies on. Defaults to an empty array
 * (so the request will happen ONCE, after the component first renders).
 */
export const useAPIRequest = <T extends {}>(
  request: () => Promise<T>,
  initialData: T,
  deps: any[] = []
): UseAPIRequest<T> => {
  const [data, setData] = useState<T>(initialData);
  const [error, setError] = useState<Linode.ApiFieldError[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    request()
      .then(responseData => {
        setLoading(false);
        setLastUpdated(Date.now());
        setData(responseData);
      })
      .catch(err => {
        setLoading(false);
        setError(getAPIErrorOrDefault(err));
      });
  }, deps);

  return { data, loading, lastUpdated, error };
};
