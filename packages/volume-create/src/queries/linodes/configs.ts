import { useQuery } from "@tanstack/react-query";

import { linodeQueries } from "./linodes";

import type { APIError, Config } from "@linode/api-v4";

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], APIError[]>({
    ...linodeQueries.linode(id)._ctx.configs,
    enabled,
  });
};
