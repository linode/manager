import {
  createVolume,
  getLinodeVolumes,
  getVolume,
  getVolumes,
} from "@linode/api-v4";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryPresets } from "../base";
import { profileQueries } from "../profile/profile";
import { getAllVolumeTypes, getAllVolumes } from "./requests";

import type { Volume, VolumeRequestPayload } from "@linode/api-v4";
import type { APIError } from "@linode/api-v4/lib/types";
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

export const useVolumeTypesQuery = () =>
  useQuery<PriceType[], APIError[]>({
    ...volumeQueries.types,
    ...queryPresets.oneTimeFetch,
  });

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
