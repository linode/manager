import {
  createLock,
  type CreateLockPayload,
  deleteLock,
  getLock,
  getLocks,
  type ResourceLock,
} from '@linode/api-v4/lib/locks';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { APIError, Filter, Params, ResourcePage } from '@linode/api-v4';

export const lockQueries = createQueryKeys('locks', {
  lock: (id: number) => ({
    queryFn: () => getLock(id),
    queryKey: [id],
  }),
  locks: {
    contextQueries: {
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getLocks(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
});

/**
 * useLocksQuery
 *
 * Returns a paginated list of resource locks
 *
 * @example
 * const { data, isLoading } = useLocksQuery();
 */
export const useLocksQuery = (params: Params = {}, filter: Filter = {}) => {
  return useQuery<ResourcePage<ResourceLock>, APIError[]>({
    ...lockQueries.locks._ctx.paginated(params, filter),
  });
};

/**
 * useLockQuery
 *
 * Returns a single resource lock by ID
 *
 * @example
 * const { data: lock } = useLockQuery(123);
 */
export const useLockQuery = (id: number, enabled: boolean = true) => {
  return useQuery<ResourceLock, APIError[]>({
    ...lockQueries.lock(id),
    enabled,
  });
};

/**
 *
 * Creates a new resource lock
 * POST /v4beta/locks
 *
 * @example
 * const { mutate: createLock } = useCreateLockMutation();
 * createLock({
 *   entity_type: 'linode',
 *   entity_id: 12345,
 *   lock_type: 'cannot_delete',
 * });
 */
export const useCreateLockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ResourceLock, APIError[], CreateLockPayload>({
    mutationFn: (payload) => createLock(payload),
    onSuccess: () => {
      // Invalidate all lock queries
      queryClient.invalidateQueries({
        queryKey: lockQueries.locks.queryKey,
      });
    },
  });
};

/**
 *
 * Deletes a resource lock
 * DELETE /v4beta/locks/{lock_id}
 *
 * @example
 * const { mutate: deleteLock } = useDeleteLockMutation();
 * deleteLock(123);
 */
export const useDeleteLockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number>({
    mutationFn: (lockId) => deleteLock(lockId),
    onSuccess: () => {
      // Invalidate all lock queries
      queryClient.invalidateQueries({
        queryKey: lockQueries.locks.queryKey,
      });
    },
  });
};
