import {
  createStackScript,
  deleteStackScript,
  updateStackScript,
} from '@linode/api-v4';
import { queryPresets } from '@linode/queries';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { stackscriptQueries } from './keys';

import type {
  APIError,
  Filter,
  ResourcePage,
  StackScript,
  StackScriptPayload,
} from '@linode/api-v4';
import type { UseMutationOptions } from '@tanstack/react-query';

export const useMarketplaceAppsQuery = (enabled: boolean) => {
  return useQuery<StackScript[], APIError[]>({
    ...stackscriptQueries.marketplace,
    enabled,
    ...queryPresets.oneTimeFetch,
  });
};

export const useStackScriptQuery = (id: number, enabled = true) =>
  useQuery<StackScript, APIError[]>({
    ...stackscriptQueries.stackscript(id),
    enabled,
  });

/**
 * Don't use this! It only exists so users can search for their StackScripts
 * in the legacy main search.
 */
export const useAllAccountStackScriptsQuery = (enabled: boolean) =>
  useQuery<StackScript[], APIError[]>({
    ...stackscriptQueries.all,
    enabled,
  });

export const useCreateStackScriptMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<StackScript, APIError[], StackScriptPayload>({
    mutationFn: createStackScript,
    onSuccess(stackscript) {
      queryClient.setQueryData(
        stackscriptQueries.stackscript(stackscript.id).queryKey,
        stackscript
      );
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.infinite._def,
      });
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.all.queryKey,
      });
    },
  });
};

export const useStackScriptsInfiniteQuery = (
  filter: Filter = {},
  enabled = true
) =>
  useInfiniteQuery<ResourcePage<StackScript>, APIError[]>({
    ...stackscriptQueries.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useUpdateStackScriptMutation = (
  id: number,
  options?: UseMutationOptions<
    StackScript,
    APIError[],
    Partial<StackScriptPayload>
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<StackScript, APIError[], Partial<StackScriptPayload>>({
    mutationFn: (data) => updateStackScript(id, data),
    ...options,
    onSuccess(stackscript, vars, ctx) {
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.infinite._def,
      });
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.all.queryKey,
      });
      queryClient.setQueryData<StackScript>(
        stackscriptQueries.stackscript(id).queryKey,
        stackscript
      );
      if (options?.onSuccess) {
        options.onSuccess(stackscript, vars, ctx);
      }
    },
  });
};

export const useDeleteStackScriptMutation = (
  id: number,
  options: UseMutationOptions<{}, APIError[]>
) => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[]>({
    mutationFn: () => deleteStackScript(id),
    ...options,
    onSuccess(...params) {
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.infinite._def,
      });
      queryClient.invalidateQueries({
        queryKey: stackscriptQueries.all.queryKey,
      });
      queryClient.removeQueries({
        queryKey: stackscriptQueries.stackscript(id).queryKey,
      });
      if (options.onSuccess) {
        options.onSuccess(...params);
      }
    },
  });
};
