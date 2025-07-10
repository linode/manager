import { linodeConfigInterfaceFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import { http } from 'msw';

import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../../indexedDB';
import { addFirewallDevice } from './linodes';

import type { Config, Interface } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

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
        [linode.id, configInterface],
        mockState
      );

      // @TODO CONNIE - move to helper function of sorts
      if (interfacePayload.purpose === 'vpc') {
        // Update corresponding VPC when creating a VPC interface
        const subnetFromDB = await mswDB.get(
          'subnets',
          configInterface.subnet_id ?? -1
        );
        const vpc = await mswDB.get(
          'vpcs',
          configInterface.vpc_id ?? subnetFromDB?.[0] ?? -1
        );

        if (subnetFromDB && vpc) {
          // update VPC/subnet to include this new interface
          const updatedSubnet = {
            ...subnetFromDB[1],
            linodes: [
              ...subnetFromDB[1].linodes,
              {
                id: linode.id,
                interfaces: [
                  {
                    active: true,
                    config_id: configId,
                    id: newlyAddedConfigInterface[1].id,
                  },
                ],
              },
            ],
            updated: DateTime.now().toISO(),
          };

          const updatedVPC = {
            ...vpc,
            subnets: vpc.subnets.map((subnet) => {
              if (subnet.id === subnetFromDB[1].id) {
                return updatedSubnet;
              }

              return subnet;
            }),
          };

          await mswDB.update(
            'subnets',
            subnetFromDB[1].id,
            [vpc.id, updatedSubnet],
            mockState
          );
          await mswDB.update('vpcs', vpc.id, updatedVPC, mockState);
        }
      }

      return makeResponse(newlyAddedConfigInterface[1]);
    }
  ),
];

// deleteLinodeConfigInterface
export const deleteLinodeConfigInterface = (mockState: MockState) => [
  http.delete(
    '*/v4*/linodes/instances/:id/configs/:configId/interfaces/:interfaceId',
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
        const subnetFromDB = await mswDB.get(
          'subnets',
          configInterface.subnet_id
        );
        const vpc = await mswDB.get(
          'vpcs',
          configInterface.vpc_id ?? subnetFromDB?.[0] ?? -1
        );

        if (subnetFromDB && vpc) {
          // update VPC/subnet to remove interface
          const updatedLinodeData = subnetFromDB[1].linodes.map((data) => {
            return {
              ...data,
              interfaces: data.interfaces.filter(
                (iface) => iface.id !== interfaceId
              ),
            };
          });

          const updatedSubnet = {
            ...subnetFromDB[1],
            linodes: updatedLinodeData,
            updated: DateTime.now().toISO(),
          };

          const updatedVPC = {
            ...vpc,
            subnets: vpc.subnets.map((subnet) => {
              if (subnet.id === subnetFromDB[1].id) {
                return updatedSubnet;
              }

              return subnet;
            }),
          };

          await mswDB.update(
            'subnets',
            subnetFromDB[1].id,
            [vpc.id, updatedSubnet],
            mockState
          );
          await mswDB.update('vpcs', vpc.id, updatedVPC, mockState);
        }
      }

      await mswDB.delete('configInterfaces', interfaceId, mockState);

      return makeResponse({});
    }
  ),
];
