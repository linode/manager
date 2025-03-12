import { deleteLinodeConfigInterface } from '@linode/api-v4';
import { linodeQueries, vpcQueries } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import type {
  APIError,
  DeleteLinodeConfigInterfacePayload,
} from '@linode/api-v4';

interface IdsForUnassignLinode extends DeleteLinodeConfigInterfacePayload {
  vpcId: number;
}

type InvalidateSubnetLinodeConfigQueryIds = Omit<
  IdsForUnassignLinode,
  'interfaceId'
>;

export const useUnassignLinode = () => {
  const queryClient = useQueryClient();
  const [unassignLinodesErrors, setUnassignLinodesErrors] = React.useState<
    APIError[]
  >([]);

  const invalidateQueries = async ({
    linodeId,
    vpcId,
  }: InvalidateSubnetLinodeConfigQueryIds) => {
    const queryKeys = [
      vpcQueries.all._def,
      vpcQueries.paginated._def,
      vpcQueries.vpc(vpcId).queryKey,
      vpcQueries.vpc(vpcId)._ctx.subnets.queryKey,
      linodeQueries.linode(linodeId)._ctx.configs.queryKey,
    ];
    await Promise.all(
      queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
    );
  };

  const unassignLinode = async ({
    configId,
    interfaceId,
    linodeId,
    vpcId,
  }: IdsForUnassignLinode) => {
    await deleteLinodeConfigInterface(linodeId, configId, interfaceId);
    invalidateQueries({ configId, linodeId, vpcId });
  };

  return {
    invalidateQueries,
    setUnassignLinodesErrors,
    unassignLinode,
    unassignLinodesErrors,
  };
};
