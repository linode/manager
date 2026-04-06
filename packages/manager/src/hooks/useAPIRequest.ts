import produce from 'immer';
import { useEffect, useState } from 'react';

import type { APIError } from '@linode/api-v4/lib/types';

export interface UseAPIRequest<T> {
  data: T;
  error?: APIError[];
  lastUpdated: number;
  loading: boolean;
  transformData: (fn: (data: T) => void) => void;
  update: () => void;
}

// @todo: write a README for this hook.

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
 * const { data, loading, lastUpdated, error } = useAPIData<Account | null>(
 *  getAccountInfo,
 *  null // Initial value of `data`
 * );
 * ```
 *
 * Get Linodes:
 *
 * We'd like to resolve `response.data` from the request, so we can deal with Linode[]
 * instead of ResourcePage<Linode>.
 *
 * ```typescript
 * const { data, loading, lastUpdated, error } = useAPIData<Linode[]>(
 *  () => getLinodes().then(linodes => linodes.data) // resolve `data` from request
 *  [], // Initial value of `data`
 *  [props.someProp] // Run the request when `props.someProp` changes
 * );
 * ```
 *
 * @deprecated Please don't use this. Use React Query!
 *
 * @param request The request function to execute when `deps` change.
 * @param defaultData Value to use for `data` before request is made.
 * @param deps The dependencies this hook relies on. Defaults to an empty array
 * (so the request will happen ONCE, after the component first renders).
 */
export const useAPIRequest = <T>(
  request: (() => Promise<T>) | null,
  initialData: T,
  deps: any[] = []
): UseAPIRequest<T> => {
  const [data, setData] = useState<T>(initialData);
  const [error, setError] = useState<APIError[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  let mounted = true;

  const _request = () => {
    if (!request) {
      return;
    }

    setLoading(true);
    setError(undefined);
    request()
      .then((responseData) => {
        if (!mounted) {
          return;
        }
        setLoading(false);
        setLastUpdated(Date.now());
        setData(responseData);
      })
      .catch((err) => {
        if (!mounted) {
          return;
        }
        setLoading(false);
        setError(err);
      });
  };

  useEffect(() => {
    _request();
    return () => {
      mounted = false;
    };
  }, deps);

  const transformData = (fn: (data: T) => void) => {
    setData(produce<T, T>(data, fn));
  };

  return { data, error, lastUpdated, loading, transformData, update: _request };
};
