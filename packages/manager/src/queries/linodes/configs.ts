import {
  Config,
  ConfigInterfaceOrderPayload,
  Interface,
  InterfacePayload,
  LinodeConfigCreationData,
  UpdateConfigInterfacePayload,
  appendConfigInterface,
  createLinodeConfig,
  deleteLinodeConfig,
  deleteLinodeConfigInterface,
  getConfigInterface,
  getConfigInterfaces,
  updateConfigInterface,
  updateLinodeConfig,
  updateLinodeConfigOrder,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FormattedAPIError } from 'src/types/FormattedAPIError';

import { queryKey } from './linodes';
import { getAllLinodeConfigs } from './requests';

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], FormattedAPIError[]>(
    [queryKey, 'linode', id, 'configs'],
    () => getAllLinodeConfigs(id),
    { enabled }
  );
};

export const configQueryKey = 'configs';
export const interfaceQueryKey = 'interfaces';

// Config queries
export const useLinodeConfigDeleteMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLinodeConfig(linodeId, configId),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeId,
          configQueryKey,
        ]);
      },
    }
  );
};

export const useLinodeConfigCreateMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<Config, FormattedAPIError[], LinodeConfigCreationData>(
    (data) => createLinodeConfig(linodeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeId,
          configQueryKey,
        ]);
      },
    }
  );
};

export const useLinodeConfigUpdateMutation = (
  linodeId: number,
  configId: number
) => {
  const queryClient = useQueryClient();
  return useMutation<
    Config,
    FormattedAPIError[],
    Partial<LinodeConfigCreationData>
  >((data) => updateLinodeConfig(linodeId, configId, data), {
    onSuccess() {
      queryClient.invalidateQueries([
        queryKey,
        'linode',
        linodeId,
        configQueryKey,
      ]);
    },
  });
};

// Config Interface queries
export const useConfigInterfacesQuery = (
  linodeID: number,
  configID: number
) => {
  return useQuery<Interface[], FormattedAPIError[]>(
    [
      queryKey,
      'linode',
      linodeID,
      configQueryKey,
      'config',
      configID,
      interfaceQueryKey,
    ],
    () => getConfigInterfaces(linodeID, configID),
    { keepPreviousData: true }
  );
};

export const useConfigInterfaceQuery = (
  linodeID: number,
  configID: number,
  interfaceID: number
) => {
  return useQuery<Interface, FormattedAPIError[]>(
    [
      queryKey,
      'linode',
      linodeID,
      configQueryKey,
      'config',
      configID,
      interfaceQueryKey,
      'interface',
      interfaceID,
    ],
    () => getConfigInterface(linodeID, configID, interfaceID),
    { keepPreviousData: true }
  );
};

export const useConfigInterfacesOrderMutation = (
  linodeID: number,
  configID: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[], ConfigInterfaceOrderPayload>(
    (data) => updateLinodeConfigOrder(linodeID, configID, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeID,
          configQueryKey,
          'config',
          interfaceQueryKey,
        ]);
      },
    }
  );
};

export const useAppendConfigInterfaceMutation = (
  linodeID: number,
  configID: number
) => {
  const queryClient = useQueryClient();
  return useMutation<Interface, FormattedAPIError[], InterfacePayload>(
    (data) => appendConfigInterface(linodeID, configID, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeID,
          configQueryKey,
          'config',
          configID,
          interfaceQueryKey,
        ]);
      },
    }
  );
};

export const useUpdateConfigInterfaceMutation = (
  linodeID: number,
  configID: number,
  interfaceID: number
) => {
  const queryClient = useQueryClient();
  return useMutation<
    Interface,
    FormattedAPIError[],
    UpdateConfigInterfacePayload
  >((data) => updateConfigInterface(linodeID, configID, interfaceID, data), {
    onSuccess: (InterfaceObj) => {
      queryClient.invalidateQueries([
        queryKey,
        'linode',
        linodeID,
        configQueryKey,
        'config',
        configID,
        interfaceQueryKey,
      ]);
      queryClient.setQueryData<Interface>(
        [
          queryKey,
          'linode',
          linodeID,
          configQueryKey,
          'config',
          configID,
          interfaceQueryKey,
          'interface',
          InterfaceObj.id,
        ],
        InterfaceObj
      );
    },
  });
};

export const useDeleteConfigInterfaceMutation = (
  linodeID: number,
  configID: number,
  interfaceID: number
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, FormattedAPIError[]>(
    () => deleteLinodeConfigInterface(linodeID, configID, interfaceID),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeID,
          configQueryKey,
          'config',
          configID,
          interfaceQueryKey,
        ]);
        queryClient.removeQueries([
          queryKey,
          'linode',
          linodeID,
          configQueryKey,
          'config',
          configID,
          interfaceQueryKey,
          'interface',
          interfaceID,
        ]);
      },
    }
  );
};
