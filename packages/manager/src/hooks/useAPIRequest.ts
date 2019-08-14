import { useEffect, useState } from 'react';

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
 * Get account info:
 *
 * ```typescript
 * const { data, loading, lastUpdated, error } = useAPIData<Linode.Account | null>(
 *  getAccountInfo,
 *  null // Initial value of `data`
 * );
 * ```
 *
 * Get Linodes:
 *
 * We'd like to resolve `response.data` from the request, so we can deal with Linode.Linode[]
 * instead of Linode.ResourcePage<Linode.Linode>.
 *
 * ```typescript
 * const { data, loading, lastUpdated, error } = useAPIData<Linode.Linode[]>(
 *  () => getLinodes().then(linodes => linodes.data) // resolve `data` from request
 *  [], // Initial value of `data`
 *  [props.someProp] // Run the request when `props.someProp` changes
 * );
 * ```
 *
 * @param request The request function to execute when `deps` change.
 * @param defaultData Value to use for `data` before request is made.
 * @param deps The dependencies this hook relies on. Defaults to an empty array
 * (so the request will happen ONCE, after the component first renders).
 */
export const useAPIRequest = <T>(
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
        setError(err);
      });
  }, deps);

  return { data, loading, lastUpdated, error };
};
