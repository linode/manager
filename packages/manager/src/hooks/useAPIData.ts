import { useEffect, useState } from 'react';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface UseAPIData<T> {
  data: T[];
  loading: boolean;
  lastUpdated: number;
  error?: Linode.ApiFieldError[];
}

/**
 *
 * useAPIData()
 *
 * Hook that executes a given request function and appropriately sets
 * `data`, `loading`, `lastUpdated`, and `error`.
 *
 * Type param `T` must include a `data` property (e.g. APIResponsePage, GetAllData).
 *
 * Defaults to making the request on first render. This is controlled
 * with the `deps` argument.
 *
 * EXAMPLE USAGE:
 *
 * const { data, loading, lastUpdated, error } = useAPIData<Page<Linode.Domain.Record>>(
 *  getDomainRecords
 * );
 *
 * @param request The request function to execute when `deps` change.
 * @param deps The dependencies this hook relies on. Defaults to an empty array
 * (so the request will happen ONCE, after the component first renders).
 */
export const useAPIData = <T extends { data: any }>(
  request: () => Promise<T>,
  deps: any[] = []
): UseAPIData<T> => {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Linode.ApiFieldError[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    request()
      .then(res => {
        setLoading(false);
        setLastUpdated(Date.now());
        setData(res.data);
      })
      .catch(err => {
        setLoading(false);
        setError(getAPIErrorOrDefault(err));
      });
  }, deps);

  return { data, loading, lastUpdated, error };
};
