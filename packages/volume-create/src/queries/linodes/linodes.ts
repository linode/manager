import {
  getLinode,
  getLinodeBackups,
  getLinodeFirewalls,
  getLinodeIPs,
  getLinodeKernel,
  getLinodeLish,
  getLinodeStats,
  getLinodeStatsByDate,
  getLinodeTransfer,
  getLinodeTransferByDate,
  getLinodes,
  getType,
} from "@linode/api-v4";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryPresets } from "../base";
import {
  getAllLinodeConfigs,
  getAllLinodeDisks,
  getAllLinodeKernelsRequest,
  getAllLinodeTypes,
  getAllLinodesRequest,
} from "./requests";

import type { APIError, Filter, Linode, Params } from "@linode/api-v4";

export const linodeQueries = createQueryKeys("linodes", {
  kernel: (id: string) => ({
    queryFn: () => getLinodeKernel(id),
    queryKey: [id],
  }),
  kernels: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllLinodeKernelsRequest(params, filter),
    queryKey: [params, filter],
  }),
  linode: (id: number) => ({
    contextQueries: {
      backups: {
        queryFn: () => getLinodeBackups(id),
        queryKey: null,
      },
      configs: {
        queryFn: () => getAllLinodeConfigs(id),
        queryKey: null,
      },
      disks: {
        queryFn: () => getAllLinodeDisks(id),
        queryKey: null,
      },
      firewalls: {
        queryFn: () => getLinodeFirewalls(id),
        queryKey: null,
      },
      ips: {
        queryFn: () => getLinodeIPs(id),
        queryKey: null,
      },
      lish: {
        queryFn: () => getLinodeLish(id),
        queryKey: null,
      },
      stats: {
        queryFn: () => getLinodeStats(id),
        queryKey: null,
      },
      statsByDate: (year: string, month: string) => ({
        queryFn: () => getLinodeStatsByDate(id, year, month),
        queryKey: [year, month],
      }),
      transfer: {
        queryFn: () => getLinodeTransfer(id),
        queryKey: null,
      },
      transferByDate: (year: string, month: string) => ({
        queryFn: () => getLinodeTransferByDate(id, year, month),
        queryKey: [year, month],
      }),
    },
    queryFn: () => getLinode(id),
    queryKey: [id],
  }),
  linodes: {
    contextQueries: {
      all: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllLinodesRequest(params, filter),
        queryKey: [params, filter],
      }),
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getLinodes({ page: pageParam as number, page_size: 25 }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getLinodes(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  types: {
    contextQueries: {
      all: {
        queryFn: getAllLinodeTypes,
        queryKey: null,
      },
      type: (id: string) => ({
        queryFn: () => getType(id),
        queryKey: [id],
      }),
    },
    queryKey: null,
  },
});

export const useAllLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true,
) => {
  return useQuery<Linode[], APIError[]>({
    ...linodeQueries.linodes._ctx.all(params, filter),
    ...queryPresets.longLived,
    enabled,
    placeholderData: keepPreviousData,
  });
};
