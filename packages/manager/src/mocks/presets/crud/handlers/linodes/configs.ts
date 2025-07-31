import {
  configFactory,
  linodeConfigInterfaceFactory,
  linodeConfigInterfaceFactoryWithVPC,
} from '@linode/utilities';
import { DateTime } from 'luxon';
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

export const createConfig = (mockState: MockState) => [
  http.post(
    '*/v4*/instances/:id/configs',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Config>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const configPayload = configFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      const config = await mswDB.add(
        'linodeConfigs',
        [linodeId, configPayload],
        mockState
      );

      const addInterfacePromises = [];

      // add interfaces as needed
      for (const ifacePayload of payload.interfaces ?? []) {
        const iface =
          ifacePayload.purpose === 'vpc'
            ? linodeConfigInterfaceFactoryWithVPC.build({
                ...ifacePayload,
              })
            : linodeConfigInterfaceFactory.build({
                purpose: ifacePayload.purpose,
                label: ifacePayload.purpose === 'public' ? null : 'interface',
                ipam_address:
                  ifacePayload.purpose === 'public' ? null : '10.0.0.1/24',
              });
        addInterfacePromises.push(
          mswDB.add('configInterfaces', [config[1].id, iface], mockState)
        );
      }

      const addedIfaces = await Promise.all(addInterfacePromises);
      for (const iface of addedIfaces) {
        if (iface[1].purpose === 'vpc') {
          await addInterfaceToSubnet({
            mockState,
            interfaceId: iface[1].id,
            isLinodeInterface: false,
            linodeId: linode.id,
            configId: config[1].id,
            vpcId: iface[1].vpc_id,
            subnetId: iface[1].subnet_id,
          });
        }
      }

      return makeResponse({
        ...configPayload,
        interfaces: addedIfaces.map((iface) => iface[1]),
      });
    }
  ),
];

export const deleteConfig = (mockState: MockState) => [
  http.delete(
    '*/v4*/instances/:id/configs/:configId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);
      const configId = Number(params.configId);
      const configFromDB = await mswDB.get('linodeConfigs', configId);
      const configInterfaces = await mswDB.getAll('configInterfaces');

      if (!linode || !configFromDB || !configInterfaces) {
        return makeNotFoundResponse();
      }

      const ifacesBelongingToConfig = configInterfaces.filter(
        (interfaceTuple) => interfaceTuple[0] === configId
      );

      const deleteInterfacePromises = [];
      for (const iface of ifacesBelongingToConfig) {
        deleteInterfacePromises.push(
          mswDB.delete('configInterfaces', iface[1].id, mockState)
        );
        if (iface[1].purpose === 'vpc') {
          deleteInterfacePromises.push(
            removeInterfaceFromSubnet({
              mockState,
              interfaceId: iface[1].id,
              isLinodeInterface: false,
              configId,
              vpcId: iface[1].vpc_id,
              subnetId: iface[1].subnet_id ?? -1,
            })
          );
        }
      }

      await Promise.all(deleteInterfacePromises);
      await mswDB.delete('linodeConfigs', configId, mockState);

      return makeResponse({});
    }
  ),
];

export const updateConfig = (mockState: MockState) => [
  http.put(
    '*/v4*/linode/instances/:id/configs/:configId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Config>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);
      const configId = Number(params.configId);
      const configFromDB = await mswDB.get('linodeConfigs', configId);
      const configInterfaces = await mswDB.getAll('configInterfaces');

      if (!linode || !configFromDB || !configInterfaces) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const config = configFromDB[1];
      const updatedConfig: Config = {
        ...config,
        ...payload,
        updated: DateTime.now().toISO(),
      };

      const updateInterfacePromises = [];
      const addInterfacePromises = [];
      const _updatedIfaceIds: number[] = [];

      // update / add interfaces as needed
      for (const ifacePayload of updatedConfig.interfaces ?? []) {
        if (ifacePayload.id) {
          _updatedIfaceIds.push(ifacePayload.id);
          updateInterfacePromises.push(
            mswDB.update(
              'configInterfaces',
              ifacePayload.id,
              [configId, ifacePayload],
              mockState
            )
          );
        } else {
          const iface =
            ifacePayload.purpose === 'vpc'
              ? linodeConfigInterfaceFactoryWithVPC.build({
                  ...ifacePayload,
                })
              : linodeConfigInterfaceFactory.build({
                  purpose: ifacePayload.purpose,
                });
          addInterfacePromises.push(
            mswDB.add('configInterfaces', [configId, iface], mockState)
          );
        }
      }

      await Promise.all(updateInterfacePromises);
      const addedInterfaces = await Promise.all(addInterfacePromises);
      for (const addedInterface of addedInterfaces) {
        if (addedInterface[1].purpose === 'vpc') {
          await addInterfaceToSubnet({
            mockState,
            interfaceId: addedInterface[1].id,
            isLinodeInterface: false,
            linodeId: linode.id,
            configId,
            vpcId: addedInterface[1].vpc_id,
            subnetId: addedInterface[1].subnet_id,
          });
        }
      }

      const deleteInterfacePromises = [];
      const updatedIfaceIds = [
        ..._updatedIfaceIds,
        ...addedInterfaces.map((iface) => iface[1].id),
      ];
      const oldInterfaces = configInterfaces.filter(
        (interfaceTuple) => interfaceTuple[0] === configId
      );

      for (const _iface of oldInterfaces) {
        if (!updatedIfaceIds.some((id) => id === _iface[1].id)) {
          deleteInterfacePromises.push(
            mswDB.delete('configInterfaces', _iface[1].id, mockState)
          );
          if (_iface[1].purpose === 'vpc')
            deleteInterfacePromises.push(
              await removeInterfaceFromSubnet({
                mockState,
                configId,
                interfaceId: _iface[1].id,
                isLinodeInterface: false,
                subnetId: _iface[1].subnet_id ?? -1,
                vpcId: _iface[1].vpc_id,
              })
            );
        }
      }

      await Promise.all(deleteInterfacePromises);
      await mswDB.update(
        'linodeConfigs',
        configId,
        [linodeId, updatedConfig],
        mockState
      );

      return makeResponse(updatedConfig);
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
