import { deleteLinodeConfigInterface } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { vpcQueries } from 'src/queries/vpcs/vpcs';

import type {
  APIError,
  DeleteLinodeConfigInterfacePayload,
} from '@linode/api-v4';
import { linodeQueries } from 'src/queries/linodes/linodes';

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
      vpcQueries.all.queryKey,
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
