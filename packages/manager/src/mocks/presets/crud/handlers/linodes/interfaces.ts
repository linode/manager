import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
  linodeInterfaceSettingsFactory,
} from '@linode/utilities';
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

import type {
  Config,
  Firewall,
  InterfaceGenerationType,
  LinodeInterface,
  LinodeInterfaces,
  LinodeInterfaceSettings,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getInterfaces = () => [
  http.get(
    '*/v4*/linode/instances/:id/interfaces',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterfaces>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);
      const linodeInterfaces = await mswDB.getAll('linodeInterfaces');

      if (
        !linode ||
        !linodeInterfaces ||
        linode.interface_generation !== 'linode'
      ) {
        return makeNotFoundResponse();
      }

      const interfaces = linodeInterfaces
        .filter((interfaceTuple) => interfaceTuple[0] === id)
        .map((interfaceTuple) => interfaceTuple[1]);

      return makeResponse({
        interfaces,
      });
    }
  ),

  http.get(
    '*/v4*/linode/instances/:id/interfaces/:interfaceId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterface>> => {
      const id = Number(params.id);
      const interfaceId = Number(params.interfaceId);
      const linode = await mswDB.get('linodes', id);
      const linodeInterface = await mswDB.get('linodeInterfaces', interfaceId);

      if (!linode || !linodeInterface) {
        return makeNotFoundResponse();
      }

      return makeResponse(linodeInterface[1]);
    }
  ),

  // todo: connect this to the DB eventually
  http.get(
    '*/v4*/linode/instances/:id/interfaces/settings',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterfaceSettings>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const linodeSettings = linodeInterfaceSettingsFactory.build();

      return makeResponse(linodeSettings);
    }
  ),
]
export const getLinodeInterfaceFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4*/linode/instances/:id/interfaces/:interfaceId/firewalls',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>>
    > => {
      const linodeId = Number(params.id);
      const interfaceId = Number(params.interfaceId);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === linodeId
      );
      const linodeInterface = mockState.linodes.find(
        (stateLinode) => stateLinode.id === interfaceId
      );
      const allFirewalls = await mswDB.getAll('firewalls');

      if (!linode || !linodeInterface || !allFirewalls) {
        return makeNotFoundResponse();
      }

      const linodeInterfaceFirewalls = allFirewalls.filter((firewall) =>
        firewall.entities.some((entity) => entity.id === interfaceId)
      );

      return makePaginatedResponse({
        data: linodeInterfaceFirewalls,
        request,
      });
    }
  ),
];

export const createLinodeInterface = (mockState: MockState) => [
  http.post(
    '*/v4*/linode/instances/:id/interfaces',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterface>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      let linodeInterface;

      if (payload.vpc) {
        linodeInterface = linodeInterfaceFactoryVPC.build({
          ...payload,
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });

        const createdInterface = await mswDB.add(
          'linodeInterfaces',
          [linodeId, linodeInterface],
          mockState
        );

        // Update corresponding VPC when creating a VPC Linode Interface
        const subnetFromDB = await mswDB.get(
          'subnets',
          payload.vpc.subnet_id ?? -1
        );
        const vpc = await mswDB.get(
          'vpcs',
          payload.vpc.vpc_id ?? subnetFromDB?.[0] ?? -1
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
                    config_id: null,
                    // ensure interface ID in subnet matches interface ID in DB
                    id: createdInterface[1].id,
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
      } else if (payload.vlan) {
        linodeInterface = linodeInterfaceFactoryVlan.build({
          ...payload,
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
      } else {
        linodeInterface = linodeInterfaceFactoryPublic.build({
          ...payload,
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
      }

      if (!payload.vpc) {
        await mswDB.add(
          'linodeInterfaces',
          [linodeId, linodeInterface],
          mockState
        );
      }

      if (payload.firewall_id) {
        await addFirewallDevice({
          entityId: linodeInterface.id,
          entityLabel: linode.label,
          firewallId: payload.firewall_id,
          interfaceType: 'linode_interface',
          mockState,
        });
      }

      queueEvents({
        event: {
          action: 'interface_create',
          entity: {
            id: linodeInterface.id,
            label: linode.label,
            type: 'linodeInterface',
            url: `/v4beta/linodes/instances/${linode.id}/interfaces`,
          },
        },
        mockState,
        sequence: [{ status: 'finished' }],
      });

      return makeResponse(linodeInterface);
    }
  ),
];

export const deleteLinodeInterface = (mockState: MockState) => [
  http.delete(
    '*/v4*/linodes/instances/:id/interfaces/:interfaceId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const linodeId = Number(params.id);
      const interfaceId = Number(params.interfaceId);
      const linode = await mswDB.get('linodes', linodeId);
      const linodeInterface = await mswDB.get('linodeInterfaces', interfaceId);

      if (!linode || !linodeInterface) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('linodeInterfaces', interfaceId, mockState);

      // todo connie: add vpc stuff... 

      queueEvents({
        event: {
          action: 'interface_delete',
          entity: {
            id: interfaceId,
            label: linode.label,
            type: 'interface',
            url: `/v4beta/linodes/instances/${linode.id}/interfaces`,
          },
        },
        mockState,
        sequence: [{ status: 'finished' }],
      });

      return makeResponse({});
    }
  ),
];

export const updateLinodeInterface = (mockState: MockState) => [
  http.put(
    '*/v4*/linodes/instances/:id/interfaces/:interfaceId',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterface>> => {
      const linodeId = Number(params.id);
      const interfaceId = Number(params.interfaceId);
      const linode = await mswDB.get('linodes', linodeId);
      const linodeInterface = await mswDB.get('linodeInterfaces', interfaceId);

      if (!linode || !linodeInterface) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const updatedInterface = {
        ...linodeInterface[1],
        ...payload,
        updated: DateTime.now().toISO(),
      };

      await mswDB.update(
        'linodeInterfaces',
        interfaceId,
        [linodeId, updatedInterface],
        mockState
      );

      queueEvents({
        event: {
          action: 'interface_update',
          entity: {
            id: interfaceId,
            label: linode.label,
            type: 'subnets',
            url: `/v4beta/linodes/instances/${linode.id}/interfaces`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedInterface);
    }
  ),
];

const convertToLinodeInterfaces = (config: Config | undefined) => {
  const linodeInterfacePublic = linodeInterfaceFactoryPublic.build({
    created: DateTime.now().toISO(),
    updated: DateTime.now().toISO(),
  });
  if (!config || config.interfaces?.length === 0) {
    return [linodeInterfacePublic];
  }
  return (
    config.interfaces?.map((iface) => {
      if (iface.purpose === 'public') {
        return linodeInterfacePublic;
      } else if (iface.purpose === 'vlan') {
        return linodeInterfaceFactoryVlan.build({
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
      } else {
        return linodeInterfaceFactoryVPC.build({
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
      }
    }) ?? [linodeInterfacePublic]
  );
};

export const upgradeToLinodeInterfaces = (mockState: MockState) => [
  http.post(
    '*/v4*/linode/instances/:id/upgrade-interfaces',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | UpgradeInterfaceData>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);
      const linodeConfigs = await mswDB.getAll('linodeConfigs');

      if (!linode || !linodeConfigs) {
        return makeNotFoundResponse();
      }

      const configs = linodeConfigs
        .filter((configTuple) => configTuple[0] === linodeId)
        .map((configTuple) => configTuple[1]);

      const payload: UpgradeInterfacePayload = {
        ...(await request.clone().json()),
      };

      const { config_id, dry_run } = payload;
      const config =
        configs.find((config) => config.id === config_id) ?? configs[0];

      const linodeInterfaces = convertToLinodeInterfaces(config);

      const addLinodeInterfacePromises = [];
      const updateConfigPromises = [];

      // if not a dry run, update everything
      if (dry_run === false) {
        // for all configs, remove the interfaces
        const updatedConfigs = configs.map((config) => {
          return { ...config, interfaces: null };
        });
        const updatedLinode = {
          ...linode,
          interface_generation: 'linode' as InterfaceGenerationType,
        };

        for (const linodeInterface of linodeInterfaces) {
          addLinodeInterfacePromises.push(
            mswDB.add(
              'linodeInterfaces',
              [linodeId, linodeInterface],
              mockState
            )
          );
        }

        for (const updatedConfig of updatedConfigs) {
          updateConfigPromises.push(
            mswDB.update(
              'linodeConfigs',
              config.id,
              [linodeId, updatedConfig],
              mockState
            )
          );
        }

        await Promise.all(addLinodeInterfacePromises);
        await Promise.all(updateConfigPromises);
        await mswDB.update('linodes', linodeId, updatedLinode, mockState);
      }

      return makeResponse({
        config_id: config_id ?? config.id ?? -1,
        dry_run: dry_run ?? true,
        interfaces: linodeInterfaces,
      });
    }
  ),
];

export const updateLinodeInterfaceSettings = () => [
  http.put(
    '*/v4*/linodes/instances/:id/interfaces/settings',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | LinodeInterfaceSettings>> => {
      const linodeId = Number(params.id);
      const linode = await mswDB.get('linodes', linodeId);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();

      const updatedSettings = linodeInterfaceSettingsFactory.build({
        ...payload,
      });

      return makeResponse(updatedSettings);
    }
  ),
];
