import {
  createStackScript,
  deleteStackScript,
  getStackScript,
  getStackScripts,
  updateStackScript,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getOneClickApps } from 'src/features/StackScripts/stackScriptUtils';
import { getAll } from '@linode/utilities';

import { queryPresets } from '@linode/queries';

import type {
  APIError,
  Filter,
  Params,
  ResourcePage,
  StackScript,
  StackScriptPayload,
} from '@linode/api-v4';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { EventHandlerData } from '@linode/queries';

export const getAllOCAsRequest = (passedParams: Params = {}) =>
  getAll<StackScript>((params) =>
    getOneClickApps({ ...params, ...passedParams })
  )().then((data) => data.data);

export const getAllAccountStackScripts = () =>
  getAll<StackScript>((params) =>
    getStackScripts(params, { mine: true })
  )().then((data) => data.data);

export const stackscriptQueries = createQueryKeys('stackscripts', {
  all: {
    queryFn: () => getAllAccountStackScripts(),
    queryKey: null,
  },
  infinite: (filter: Filter = {}) => ({
    queryFn: ({ pageParam }) =>
      getStackScripts({ page: pageParam as number, page_size: 25 }, filter),
    queryKey: [filter],
  }),
  marketplace: {
    queryFn: () => getAllOCAsRequest(),
    queryKey: null,
  },
  stackscript: (id: number) => ({
    queryFn: () => getStackScript(id),
    queryKey: [id],
  }),
});

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

export const stackScriptEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  // Keep the infinite store up to date
  invalidateQueries({
    queryKey: stackscriptQueries.infinite._def,
  });
  invalidateQueries({
    queryKey: stackscriptQueries.all.queryKey,
  });

  // If the event has a StackScript entity attached, invalidate it
  if (event.entity?.id) {
    invalidateQueries({
      queryKey: stackscriptQueries.stackscript(event.entity.id).queryKey,
    });
  }
};
