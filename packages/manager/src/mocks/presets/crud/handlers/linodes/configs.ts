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
      const updatedConfig = {
        ...config[1],
        interfaces: [...(config[1].interfaces ?? []), configInterface],
      };

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
                    // NOTE: configInterface.id may be duplicated across all subnets, as we are not storing
                    // a separate configInterface field in our mock DB. This is to reduce complexity (ie needing to fetch/update
                    // a config and then an interface for our mock operations)
                    // We currently do not fetch/update individual config interfaces anyway
                    // See VPC/Subnet delete crud handlers
                    id: configInterface.id,
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

      await mswDB.update(
        'linodeConfigs',
        configId,
        [linode.id, updatedConfig],
        mockState
      );

      return makeResponse(configInterface);
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
      const linode = await mswDB.get('linodes', linodeId);
      const config = await mswDB.get('linodeConfigs', configId);

      if (!linode || !config) {
        return makeNotFoundResponse();
      }

      const updatedConfig = {
        ...config[1],
        interfaces: [],
      };

      // to "delete" the interface, we will set the config's interfaces to []. While this isn't accurate to the actual API, this reduces complexity on our end
      // update this may be changed ... i'm thinking some more 
      await mswDB.update(
        'linodeConfigs',
        configId,
        [linode.id, updatedConfig],
        mockState
      );

      return makeResponse({});
    }
  ),
];

// todo: potentially add back in storing the interfaces separately - need to think about how complicated vpc / subnet deletion can be :sobbing: 
// OH ANOTHER THOUGHT - what if we always leave configs.interfaces empty, but when we actually return a config, we must also make a request to its interfaces?
// maybe that makes more sense... (don't need to update the config in tandem -> help out with deleting subnet / vpc)