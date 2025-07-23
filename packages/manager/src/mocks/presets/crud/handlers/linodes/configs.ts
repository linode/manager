import { linodeConfigInterfaceFactory } from '@linode/utilities';
import { http } from 'msw';

import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../../indexedDB';
import { addInterfaceToSubnet, removeInterfaceFromSubnet } from './utils';

import type { Config, Interface } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getConfigs = () => [
  http.get(
    '*/v4*/linode/instances/:id/configs',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Config>>
    > => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);
      const linodeConfigs = await mswDB.getAll('linodeConfigs');
      const configInterfaces = await mswDB.getAll('configInterfaces');

      if (!linode || !linodeConfigs || !configInterfaces) {
        return makeNotFoundResponse();
      }

      const configs = linodeConfigs
        .filter((configTuple) => configTuple[0] === id)
        .map((configTuple) => {
          const interfacesForConfig = configInterfaces
            .filter((interfaceTuple) => interfaceTuple[0] === configTuple[1].id)
            .map((interfaceTuple) => interfaceTuple[1]);
          return { ...configTuple[1], interfaces: interfacesForConfig };
        });

      return makePaginatedResponse({
        data: configs,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/linode/instances/:id/configs/:configId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Config>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);
      const configId = Number(params.configId);
      const linodeConfig = await mswDB.get('linodeConfigs', configId);
      const configInterfaces = await mswDB.getAll('configInterfaces');

      if (!linode || !linodeConfig || !configInterfaces) {
        return makeNotFoundResponse();
      }

      const interfaces = configInterfaces
        .filter((interfaceTuple) => interfaceTuple[0] === configId)
        .map((interfaceTuple) => interfaceTuple[1]);

      return makeResponse({
        ...linodeConfig[1],
        interfaces,
      });
    }
  ),
];

export const appendConfigInterface = (mockState: MockState) => [
  http.post(
    '*/v4*/linode/instances/:id/configs/:configId/interfaces',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Interface>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);
      const configId = Number(params.configId);
      const config = await mswDB.get('linodeConfigs', configId);

      if (!linode || !config) {
        return makeNotFoundResponse();
      }

      const interfacePayload = await request.clone().json();
      const configInterface = linodeConfigInterfaceFactory.build({
        ...interfacePayload,
        active: true,
      });

      const newlyAddedConfigInterface = await mswDB.add(
        'configInterfaces',
        [configId, configInterface],
        mockState
      );

      if (interfacePayload.purpose === 'vpc') {
        await addInterfaceToSubnet({
          mockState,
          interfaceId: newlyAddedConfigInterface[1].id,
          isLinodeInterface: false,
          linodeId: linode.id,
          configId,
          vpcId: configInterface.vpc_id,
          subnetId: configInterface.subnet_id,
        });
      }

      return makeResponse(newlyAddedConfigInterface[1]);
    }
  ),
];

export const deleteConfigInterface = (mockState: MockState) => [
  http.delete(
    '*/v4*/linode/instances/:id/configs/:configId/interfaces/:interfaceId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const linodeId = Number(params.id);
      const configId = Number(params.configId);
      const interfaceId = Number(params.interfaceId);
      const linode = await mswDB.get('linodes', linodeId);
      const config = await mswDB.get('linodeConfigs', configId);
      const configInterfaceTuple = await mswDB.get(
        'configInterfaces',
        interfaceId
      );

      if (!linode || !config || !configInterfaceTuple) {
        return makeNotFoundResponse();
      }

      // if the config interface is part of a VPC, we must update the VPC as well
      const configInterface = configInterfaceTuple[1];
      if (configInterface.purpose === 'vpc' && configInterface.subnet_id) {
        await removeInterfaceFromSubnet({
          mockState,
          configId,
          interfaceId: configInterface.id,
          isLinodeInterface: false,
          subnetId: configInterface.subnet_id,
          vpcId: configInterface.vpc_id,
        });
      }

      await mswDB.delete('configInterfaces', interfaceId, mockState);

      return makeResponse({});
    }
  ),
];
