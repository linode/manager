import { deleteLinodeConfigInterface } from '@linode/api-v4';
import { linodeQueries, vpcQueries } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import type { APIError } from '@linode/api-v4';

interface IdsForUnassignLinode {
  configId: null | number;
  interfaceId: number;
  linodeId: number;
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
    configId,
  }: InvalidateSubnetLinodeConfigQueryIds) => {
    const interfacesQueryKey = configId
      ? linodeQueries.linode(linodeId)._ctx.configs.queryKey
      : linodeQueries.linode(linodeId)._ctx.interfaces.queryKey;
    const queryKeys = [
      vpcQueries.all._def,
      vpcQueries.paginated._def,
      vpcQueries.vpc(vpcId).queryKey,
      vpcQueries.vpc(vpcId)._ctx.subnets.queryKey,
      interfacesQueryKey,
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
    if (configId) {
      await deleteLinodeConfigInterface(linodeId, configId, interfaceId);
    } else {
      // delete Linode Interface
    }
    invalidateQueries({ configId, linodeId, vpcId });
  };

  return {
    invalidateQueries,
    setUnassignLinodesErrors,
    unassignLinode,
    unassignLinodesErrors,
  };
};
