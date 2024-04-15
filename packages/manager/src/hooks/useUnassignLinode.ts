import { deleteLinodeConfigInterface } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { configQueryKey, interfaceQueryKey } from 'src/queries/linodes/configs';
import { queryKey } from 'src/queries/linodes/linodes';
import { vpcQueries } from 'src/queries/vpcs/vpcs';

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
    configId,
    linodeId,
    vpcId,
  }: InvalidateSubnetLinodeConfigQueryIds) => {
    const queryKeys = [
      vpcQueries.all.queryKey,
      vpcQueries.paginated._def,
      vpcQueries.vpc(vpcId).queryKey,
      vpcQueries.vpc(vpcId)._ctx.subnets.queryKey,
      [
        queryKey,
        'linode',
        linodeId,
        configQueryKey,
        'config',
        configId,
        interfaceQueryKey,
      ],
    ];
    await Promise.all(
      queryKeys.map((key) => queryClient.invalidateQueries(key))
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
    queryClient.invalidateQueries([
      queryKey,
      'linode',
      linodeId,
      configQueryKey,
      'config',
      configId,
      interfaceQueryKey,
      'interface',
      interfaceId,
    ]);
  };

  return {
    invalidateQueries,
    setUnassignLinodesErrors,
    unassignLinode,
    unassignLinodesErrors,
  };
};
