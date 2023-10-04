import { deleteLinodeConfigInterface } from '@linode/api-v4';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { configQueryKey, interfaceQueryKey } from 'src/queries/linodes/configs';
import { queryKey } from 'src/queries/linodes/linodes';
import { subnetQueryKey, vpcQueryKey } from 'src/queries/vpcs';

import type {
  APIError,
  DeleteLinodeConfigInterfacePayload,
} from '@linode/api-v4';

type IdsForUnassignLinode = DeleteLinodeConfigInterfacePayload & {
  subnetId: number;
  vpcId: number;
};

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
    subnetId,
    vpcId,
  }: InvalidateSubnetLinodeConfigQueryIds) => {
    const queryKeys = [
      [vpcQueryKey, 'paginated'],
      [vpcQueryKey, 'vpc', vpcId],
      [vpcQueryKey, 'vpc', vpcId, subnetQueryKey],
      [vpcQueryKey, 'vpc', vpcId, subnetQueryKey, 'subnet', subnetId],
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
    subnetId,
    vpcId,
  }: IdsForUnassignLinode) => {
    await deleteLinodeConfigInterface(linodeId, configId, interfaceId);
    invalidateQueries({ configId, linodeId, subnetId, vpcId });
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
