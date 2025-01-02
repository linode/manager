import {
  attachVolume,
  cloneVolume,
  createVolume,
  deleteVolume,
  detachVolume,
  getLinodeVolumes,
  getVolume,
  getVolumes,
  migrateVolumes,
  resizeVolume,
  updateVolume,
} from "@linode/api-v4";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { accountQueries } from "../account/queries";
import { queryPresets } from "../base";
import { profileQueries } from "../profile/profile";
import { getAllVolumeTypes, getAllVolumes } from "./requests";

import type {
  AttachVolumePayload,
  CloneVolumePayload,
  ResizeVolumePayload,
  UpdateVolumeRequest,
  Volume,
  VolumeRequestPayload,
} from "@linode/api-v4";
import type { APIError, ResourcePage } from "@linode/api-v4/lib/types";
import type { Filter, Params, PriceType } from "@linode/api-v4/lib/types";

const volumeQueries = createQueryKeys("volumes", {
  linode: (linodeId: number) => ({
    contextQueries: {
      volumes: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getLinodeVolumes(linodeId, params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: [linodeId],
  }),
  lists: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllVolumes(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getVolumes({ page: pageParam as number, page_size: 25 }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getVolumes(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  types: {
    queryFn: getAllVolumeTypes,
    queryKey: null,
  },
  volume: (id: number) => ({
    queryFn: () => getVolume(id),
    queryKey: [id],
  }),
});

const useVolumeQuery = (id: number, enabled = true) => {
  return useQuery<Volume, APIError[]>({
    ...volumeQueries.volume(id),
    enabled,
  });
};

const useVolumesQuery = (params: Params, filter: Filter) =>
  useQuery<ResourcePage<Volume>, APIError[]>({
    ...volumeQueries.lists._ctx.paginated(params, filter),
    placeholderData: keepPreviousData,
  });

export const useVolumeTypesQuery = () =>
  useQuery<PriceType[], APIError[]>({
    ...volumeQueries.types,
    ...queryPresets.oneTimeFetch,
  });

const useInfiniteVolumesQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<Volume>, APIError[]>({
    ...volumeQueries.lists._ctx.infinite(filter),
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
  });

const useAllVolumesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<Volume[], APIError[]>({
    ...volumeQueries.lists._ctx.all(params, filter),
    enabled,
  });

const useLinodeVolumesQuery = (
  linodeId: number,
  params: Params = {},
  filter: Filter = {},
  enabled = true,
) =>
  useQuery<ResourcePage<Volume>, APIError[]>({
    ...volumeQueries.linode(linodeId)._ctx.volumes(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });

interface ResizeVolumePayloadWithId extends ResizeVolumePayload {
  volumeId: number;
}

const useResizeVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], ResizeVolumePayloadWithId>({
    mutationFn: ({ volumeId, ...data }) => resizeVolume(volumeId, data),
    onSuccess(volume) {
      // Update the specific volume
      queryClient.setQueryData<Volume>(
        volumeQueries.volume(volume.id).queryKey,
        volume,
      );
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
      // If the volume is assigned to a Linode, invalidate that Linode's list
      if (volume.linode_id) {
        queryClient.invalidateQueries({
          queryKey: volumeQueries.linode(volume.linode_id)._ctx.volumes._def,
        });
      }
    },
  });
};

interface CloneVolumePayloadWithId extends CloneVolumePayload {
  volumeId: number;
}

const useCloneVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], CloneVolumePayloadWithId>({
    mutationFn: ({ volumeId, ...data }) => cloneVolume(volumeId, data),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
    },
  });
};

const useDeleteVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => deleteVolume(id),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
    },
  });
};

export const useCreateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], VolumeRequestPayload>({
    mutationFn: createVolume,
    onSuccess(volume) {
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
      if (volume.linode_id) {
        queryClient.invalidateQueries({
          queryKey: volumeQueries.linode(volume.linode_id)._ctx.volumes._def,
        });
      }
      // If a restricted user creates an entity, we must make sure grants are up to date.
      queryClient.invalidateQueries({
        queryKey: profileQueries.grants.queryKey,
      });
    },
  });
};

const useVolumesMigrateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number[]>({
    mutationFn: migrateVolumes,
    onSuccess: () => {
      // If a customer "force" migrates they will then see a
      // `volume_migration_imminent` notification instead of
      // the `volume_migration_scheduled` notification.
      setTimeout(() => {
        // Refetch notifications after 1.5 seconds. The API needs some time to process.
        queryClient.invalidateQueries({
          queryKey: accountQueries.notifications.queryKey,
        });
      }, 1500);
    },
  });
};

interface UpdateVolumePayloadWithId extends UpdateVolumeRequest {
  volumeId: number;
}

const useUpdateVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], UpdateVolumePayloadWithId>({
    mutationFn: ({ volumeId, ...data }) => updateVolume(volumeId, data),
    onSuccess(volume) {
      // Update the specific volume
      queryClient.setQueryData<Volume>(
        volumeQueries.volume(volume.id).queryKey,
        volume,
      );
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });
      // If the volume is assigned to a Linode, invalidate that Linodes's list
      if (volume.linode_id) {
        queryClient.invalidateQueries({
          queryKey: volumeQueries.linode(volume.linode_id)._ctx.volumes._def,
        });
      }
    },
  });
};

interface AttachVolumePayloadWithId extends AttachVolumePayload {
  volumeId: number;
}

const useAttachVolumeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Volume, APIError[], AttachVolumePayloadWithId>({
    mutationFn: ({ volumeId, ...data }) => attachVolume(volumeId, data),
    onSuccess(volume) {
      // Update the specific volume
      queryClient.setQueryData<Volume>(
        volumeQueries.volume(volume.id).queryKey,
        volume,
      );
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: volumeQueries.lists.queryKey,
      });

      // If the volume is assigned to a Linode, invalidate that Linode's list
      if (volume.linode_id) {
        queryClient.invalidateQueries({
          queryKey: volumeQueries.linode(volume.linode_id)._ctx.volumes._def,
        });
      }
    },
  });
};

const useDetachVolumeMutation = () => {
  return useMutation<{}, APIError[], { id: number }>({
    mutationFn: ({ id }) => detachVolume(id),
  });
};
