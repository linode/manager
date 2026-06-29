import {
  addImagesToSharegroup,
  addMembersToSharegroup,
  createSharegroup,
  deleteSharegroup,
  deleteSharegroupImage,
  deleteSharegroupMember,
  deleteSharegroupToken,
  generateSharegroupToken,
  getSharegroup,
  getSharegroupFromToken,
  getSharegroupImages,
  getSharegroupImagesFromToken,
  getSharegroupMembers,
  getSharegroups,
  getUserSharegroupToken,
  getUserSharegroupTokens,
  updateSharegroup,
  updateSharegroupImage,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { imageQueries } from './images';

import type {
  AddSharegroupImagesPayload,
  AddSharegroupMemberPayload,
  APIError,
  CreateSharegroupPayload,
  Filter,
  Image,
  Params,
  ResourcePage,
  Sharegroup,
  SharegroupMember,
  SharegroupToken,
  UpdateSharegroupImagePayload,
  UpdateSharegroupPayload,
} from '@linode/api-v4';
import type {
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

export const getAllShareGroups = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Sharegroup>((params, filter) =>
    getSharegroups(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const shareGroupsQueries = createQueryKeys('sharegroups', {
  sharegroups: {
    contextQueries: {
      all: (params: Params = {}, filters: Filter = {}) => ({
        queryFn: () => getAllShareGroups(params, filters),
        queryKey: [params, filters],
      }),
      sharegroup: (sharegroupId: string) => ({
        queryFn: () => getSharegroup(sharegroupId),
        queryKey: [sharegroupId],
      }),
      images: (
        sharegroupId: string,
        params: Params = {},
        filters: Filter = {},
      ) => ({
        queryFn: () => getSharegroupImages(sharegroupId, params, filters),
        queryKey: [sharegroupId, 'images', params, filters],
      }),
      members: (
        sharegroupId: string,
        params: Params = {},
        filters: Filter = {},
      ) => ({
        queryFn: () => getSharegroupMembers(sharegroupId, params, filters),
        queryKey: [sharegroupId, 'members', params, filters],
      }),
      infinite: (filters: Filter) => ({
        queryFn: ({ pageParam }) =>
          getSharegroups({ page: pageParam as number }, filters),
        queryKey: [filters],
      }),
      paginated: (params: Params, filters: Filter) => ({
        queryFn: () => getSharegroups(params, filters),
        queryKey: [params, filters],
      }),
    },
    queryKey: null,
  },
  tokens: {
    contextQueries: {
      token: (tokenUuid: string) => ({
        queryFn: () => getUserSharegroupToken(tokenUuid),
        queryKey: [tokenUuid],
      }),
      paginated: (params: Params, filters: Filter) => ({
        queryFn: async () => getUserSharegroupTokens(params, filters),
        queryKey: [params, filters],
      }),
      sharegroup: (tokenUuid: string) => ({
        queryFn: async () => getSharegroupFromToken(tokenUuid),
        queryKey: [tokenUuid],
      }),
      sharegroupImages: (
        tokenUuid: string,
        params: Params = {},
        filters: Filter = {},
      ) => ({
        queryFn: () => getSharegroupImagesFromToken(tokenUuid, params, filters),
        queryKey: [tokenUuid, 'sharegroupImagesFromToken', params, filters],
      }),
    },
    queryKey: null,
  },
});

// Share Groups
export const useShareGroupsQuery = (
  params: Params,
  filters: Filter,
  options?: Partial<UseQueryOptions<ResourcePage<Sharegroup>, APIError[]>>,
) =>
  useQuery<ResourcePage<Sharegroup>, APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.paginated(params, filters),
    placeholderData: keepPreviousData,
    ...options,
  });

export const useShareGroupQuery = (sharegroupId: string, enabled = true) =>
  useQuery<Sharegroup, APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.sharegroup(sharegroupId),
    enabled,
  });

export const useAllShareGroupsQuery = (
  params: Params = {},
  filters: Filter = {},
  enabled: true,
) =>
  useQuery<Sharegroup[], APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.all(params, filters),
    enabled,
  });

export const useShareGroupsInfiniteQuery = (
  filters: Filter,
  enabled: boolean,
) =>
  useInfiniteQuery<ResourcePage<Sharegroup>, APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.infinite(filters),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useDeleteShareGroupMutation = (
  options: UseMutationOptions<{}, APIError[], { shareGroupId: string }>,
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { shareGroupId: string }>({
    mutationFn: ({ shareGroupId }) => deleteSharegroup(shareGroupId),
    ...options,
    onSuccess(response, variables, context) {
      options.onSuccess?.(response, variables, context);
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
      queryClient.removeQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.sharegroup(
          variables.shareGroupId,
        ).queryKey,
      });
    },
  });
};

export const useShareGroupsImagesQuery = (
  sharegroupId: string,
  params: Params = {},
  filters: Filter = {},
) =>
  useQuery<ResourcePage<Image>, APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.images(
      sharegroupId,
      params,
      filters,
    ),
    placeholderData: keepPreviousData,
  });

export const useShareGroupsMembersQuery = (
  sharegroupId: string,
  params: Params = {},
  filters: Filter = {},
) =>
  useQuery<ResourcePage<SharegroupMember>, APIError[]>({
    ...shareGroupsQueries.sharegroups._ctx.members(
      sharegroupId,
      params,
      filters,
    ),
    placeholderData: keepPreviousData,
  });

export const useCreateShareGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Sharegroup, APIError[], CreateSharegroupPayload>({
    mutationFn: createSharegroup,
    onSuccess(shareGroup) {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
      queryClient.setQueryData<Sharegroup>(
        shareGroupsQueries.sharegroups._ctx.sharegroup(shareGroup.id.toString())
          .queryKey,
        shareGroup,
      );
    },
  });
};

export const useUpdateShareGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Sharegroup,
    APIError[],
    { data: UpdateSharegroupPayload; sharegroupId: string }
  >({
    mutationFn: ({ sharegroupId, data }) =>
      updateSharegroup(sharegroupId, data),
    onSuccess(shareGroup) {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
      queryClient.setQueryData<Sharegroup>(
        shareGroupsQueries.sharegroups._ctx.sharegroup(shareGroup.id.toString())
          .queryKey,
        shareGroup,
      );
    },
  });
};

export const useShareGroupsAddMembersMutation = (
  options: UseMutationOptions<
    Sharegroup,
    APIError[],
    { data: AddSharegroupMemberPayload; sharegroupId: number }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Sharegroup,
    APIError[],
    { data: AddSharegroupMemberPayload; sharegroupId: number }
  >({
    mutationFn: ({ sharegroupId, data }) =>
      addMembersToSharegroup(sharegroupId, data),
    ...options,
    onSuccess(shareGroup, variables, context) {
      options.onSuccess?.(shareGroup, variables, context);
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.members(
          String(variables.sharegroupId),
        ).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
    },
  });
};

export const useDeleteShareGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    {},
    APIError[],
    { shareGroupId: string; token_uuid: string }
  >({
    mutationFn: ({ shareGroupId, token_uuid }) =>
      deleteSharegroupMember(shareGroupId, token_uuid),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.members(
          variables.shareGroupId,
          {},
          {},
        ).queryKey,
      });
    },
  });
};

export const useDeleteShareGroupImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], { imageId: string; shareGroupId: string }>(
    {
      mutationFn: ({ shareGroupId, imageId }) =>
        deleteSharegroupImage(shareGroupId, imageId),
      onSuccess(_, variables) {
        queryClient.invalidateQueries({
          queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
        });
        queryClient.invalidateQueries({
          queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
        });
        queryClient.invalidateQueries({
          queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
        });
        queryClient.invalidateQueries({
          queryKey: shareGroupsQueries.sharegroups._ctx.images(
            variables.shareGroupId,
            {},
            {},
          ).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: imageQueries.paginated._def,
        });
        queryClient.invalidateQueries({
          queryKey: ['image', variables.imageId, 'sharegroups'],
        });
      },
    },
  );
};

export const useUpdateShareGroupImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Image,
    APIError[],
    {
      data: UpdateSharegroupImagePayload;
      imageId: string;
      sharegroupId: string;
    }
  >({
    mutationFn: ({ sharegroupId, imageId, data }) =>
      updateSharegroupImage({ sharegroupId, imageId, data }),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.images(
          variables.sharegroupId,
        ).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.sharegroup(
          variables.sharegroupId,
        ).queryKey,
      });
    },
  });
};

export const useShareGroupsAddImagesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Sharegroup,
    APIError[],
    { data: AddSharegroupImagesPayload; sharegroupId: number }
  >({
    mutationFn: ({ sharegroupId, data }) =>
      addImagesToSharegroup(sharegroupId, data),
    onSuccess(shareGroup, variables, context) {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.paginated._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.all._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.infinite._def,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.sharegroup(
          String(variables.sharegroupId),
        ).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.sharegroups._ctx.images(
          String(variables.sharegroupId),
        ).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: imageQueries.paginated._def,
      });
      variables.data.images.forEach(({ id }) => {
        queryClient.invalidateQueries({
          queryKey: ['image', id, 'sharegroups'],
        });
      });
    },
  });
};

// Tokens
export const useShareGroupTokensQuery = (
  params: Params,
  filters: Filter,
  enabled: boolean,
) =>
  useQuery<ResourcePage<SharegroupToken>, APIError[]>({
    ...shareGroupsQueries.tokens._ctx.paginated(params, filters),
    enabled,
  });

export const useShareGroupTokenQuery = (tokenUuid: string, enabled = true) =>
  useQuery<SharegroupToken, APIError[]>({
    ...shareGroupsQueries.tokens._ctx.token(tokenUuid),
    enabled,
  });

export const useShareGroupFromTokenQuery = (
  tokenUuid: string,
  enabled = true,
) =>
  useQuery<Sharegroup, APIError[]>({
    ...shareGroupsQueries.tokens._ctx.sharegroup(tokenUuid),
    enabled,
  });

export const useShareGroupImagesFromTokenQuery = (
  tokenUuid: string,
  params: Params = {},
  filters: Filter = {},
  enabled = true,
) =>
  useQuery<ResourcePage<Image>, APIError[]>({
    ...shareGroupsQueries.tokens._ctx.sharegroupImages(
      tokenUuid,
      params,
      filters,
    ),
    enabled,
  });

export const useGenerateShareGroupTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SharegroupToken, APIError[], { sharegroupUuid: string }>({
    mutationFn: ({ sharegroupUuid }) =>
      generateSharegroupToken({ valid_for_sharegroup_uuid: sharegroupUuid }),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.tokens._ctx.paginated._def,
      });
    },
  });
};

export const useDeleteTokenFromShareGroupMutation = (
  options: UseMutationOptions<{}, APIError[], { tokenUuid: string }>,
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { tokenUuid: string }>({
    mutationFn: ({ tokenUuid }) => deleteSharegroupToken(tokenUuid),
    ...options,
    onSuccess(response, variables, context) {
      options.onSuccess?.(response, variables, context);
      queryClient.invalidateQueries({
        queryKey: shareGroupsQueries.tokens._ctx.paginated._def,
      });
    },
  });
};
