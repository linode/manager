import {
  configFactory,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { http } from 'msw';

import {
  firewallDeviceFactory,
  linodeBackupFactory,
  linodeDiskFactory,
  linodeFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
} from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  Config,
  Disk,
  Firewall,
  FirewallDeviceEntityType,
  InterfaceGenerationType,
  Linode,
  LinodeBackupsResponse,
  LinodeIPsResponse,
  LinodeInterface,
  LinodeInterfaces,
  RegionalNetworkUtilization,
  Stats,
  UpgradeInterfaceData,
  UpgradeInterfacePayload,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getLinodes = () => [
  http.get(
    '*/v4/linode/instances',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Linode>>
    > => {
      const linodes = await mswDB.getAll('linodes');

      if (!linodes) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: linodes,
        request,
      });
    }
  ),

  http.get(
    '*/v4/linode/instances/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Linode>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);

      if (!linode) {
        return makeNotFoundResponse();
      }

      return makeResponse(linode);
    }
  ),

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

  http.get(
    '*/v4/linode/instances/:id/configs',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Config>>
    > => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);
      const linodeConfigs = await mswDB.getAll('linodeConfigs');

      if (!linode || !linodeConfigs) {
        return makeNotFoundResponse();
      }

      const configs = linodeConfigs
        .filter((configTuple) => configTuple[0] === id)
        .map((configTuple) => configTuple[1]);

      return makePaginatedResponse({
        data: configs,
        request,
      });
    }
  ),
];

export const createLinode = (mockState: MockState) => [
  http.post('*/v4/linode/instances', async ({ request }) => {
    const payload = await request.clone().json();
    const linode = linodeFactory.build({
      created: DateTime.now().toISO(),
      status: 'provisioning',
      ...payload,
    });

    if (!linode.label) {
      linode.label = `linode${linode.id}`;
    }

    if (payload.firewall_id) {
      const firewall = await mswDB.get('firewalls', payload.firewall_id);
      if (firewall) {
        const entity = {
          id: linode.id,
          label: linode.label,
          type: 'linode' as FirewallDeviceEntityType,
          url: `/linodes/${linode.id}`,
        };

        const updatedFirewall = {
          ...firewall,
          entities: [...firewall.entities, entity],
        };

        const firewallDevice = firewallDeviceFactory.build({
          created: DateTime.now().toISO(),
          entity,
          updated: DateTime.now().toISO(),
        });

        await mswDB.add(
          'firewallDevices',
          [firewall.id, firewallDevice],
          mockState
        );

        await mswDB.update(
          'firewalls',
          firewall.id,
          updatedFirewall,
          mockState
        );

        queueEvents({
          event: {
            action: 'firewall_device_add',
            entity: {
              id: firewall.id,
              label: firewall.label,
              type: 'firewallDevice',
              url: `/v4beta/networking/firewalls/${firewall.id}/linodes`,
            },
          },
          mockState,
          sequence: [{ status: 'notification' }],
        });
      }
    }

    const linodeConfig = configFactory.build({
      created: DateTime.now().toISO(),
    });

    await mswDB.add('linodes', linode, mockState);
    await mswDB.add('linodeConfigs', [linode.id, linodeConfig], mockState);

    queueEvents({
      event: {
        action: 'linode_create',
        entity: {
          id: linode.id,
          label: linode.label,
          type: 'linode',
          url: `/v4/linode/instances/${linode.id}`,
        },
      },
      mockState,
      sequence: [
        { status: 'scheduled' },
        { isProgressEvent: true, status: 'started' },
        { status: 'finished' },
      ],
    })
      .then(async () => {
        await mswDB.update(
          'linodes',
          linode.id,
          { status: 'booting' },
          mockState
        );

        return queueEvents({
          event: {
            action: 'linode_boot',
            entity: {
              id: linode.id,
              label: linode.label,
              type: 'linode',
              url: `/v4/linode/instances/${linode.id}`,
            },
          },
          mockState,
          sequence: [
            { isProgressEvent: true, status: 'started' },
            { status: 'finished' },
          ],
        });
      })
      .then(async () => {
        await mswDB.update(
          'linodes',
          linode.id,
          { status: 'running' },
          mockState
        );
      });

    return makeResponse(linode);
  }),
];

export const updateLinode = (mockState: MockState) => [
  http.put(
    '*/v4/linode/instances/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Linode>> => {
      const id = Number(params.id);
      const payload = await request.clone().json();
      const linode = await mswDB.get('linodes', id);

      if (!linode) {
        return makeNotFoundResponse();
      }

      await mswDB.update('linodes', id, payload, mockState);

      queueEvents({
        event: {
          action: 'linode_update',
          entity: {
            id: linode.id,
            label: linode.label,
            type: 'linode',
            url: `/v4/linode/instances/${linode.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(linode);
    }
  ),
];

export const deleteLinode = (mockState: MockState) => [
  http.delete('*/v4/linode/instances/:id', async ({ params }) => {
    const id = Number(params.id);
    const linode = await mswDB.get('linodes', id);

    if (!linode) {
      return makeNotFoundResponse();
    }

    queueEvents({
      event: {
        action: 'linode_shutdown',
        entity: {
          id: linode.id,
          label: linode.label,
          type: 'linode',
          url: `/v4/linode/instances/${linode.id}`,
        },
      },
      mockState,
      sequence: [
        { status: 'scheduled' },
        { isProgressEvent: true, status: 'started' },
        { status: 'finished' },
      ],
    }).then(async () => {
      await mswDB.update('linodes', id, { status: 'shutting_down' }, mockState);

      return queueEvents({
        event: {
          action: 'linode_delete',
          entity: {
            id: linode.id,
            label: linode.label,
            type: 'linode',
            url: `/v4/linode/instances/${linode.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'finished' }],
      }).then(async () => {
        await mswDB.delete('linodes', id, mockState);
      });
    });

    return makeResponse({});
  }),
];

// Intentionally not storing static data the DB
export const getLinodeStats = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/stats*',
    ({ params }): StrictResponse<APIErrorResponse | Stats> => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const mockStats = linodeStatsFactory.build();

      return makeResponse(mockStats);
    }
  ),
];

// TODO: integrate with DB
export const getLinodeDisks = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/disks',
    ({
      params,
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Disk>> => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const mockDisks = linodeDiskFactory.buildList(3);

      return makePaginatedResponse({
        data: mockDisks,
        request,
      });
    }
  ),
];

// TODO: integrate with DB
export const getLinodeTransfer = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/transfer',
    ({
      params,
    }): StrictResponse<APIErrorResponse | RegionalNetworkUtilization> => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const mockTransfer = linodeTransferFactory.build();

      return makeResponse(mockTransfer);
    }
  ),
];

export const getLinodeFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/firewalls',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>>
    > => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );
      const allFirewalls = await mswDB.getAll('firewalls');

      if (!linode || !allFirewalls) {
        return makeNotFoundResponse();
      }

      const linodeFirewalls = allFirewalls.filter((firewall) =>
        firewall.entities.some((entity) => entity.id === id)
      );

      return makePaginatedResponse({
        data: linodeFirewalls,
        request,
      });
    }
  ),
];

// TODO: integrate with DB
export const getLinodeIps = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/ips',
    ({ params }): StrictResponse<APIErrorResponse | LinodeIPsResponse> => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const mockLinodeIps = linodeIPFactory.build();

      return makeResponse(mockLinodeIps);
    }
  ),
];

// TODO: integrate with DB
export const getLinodeBackups = (mockState: MockState) => [
  http.get(
    '*/v4/linode/instances/:id/backups',
    ({ params }): StrictResponse<APIErrorResponse | LinodeBackupsResponse> => {
      const id = Number(params.id);
      const linode = mockState.linodes.find(
        (stateLinode) => stateLinode.id === id
      );

      if (!linode) {
        return makeNotFoundResponse();
      }

      const mockLinodeBackup = linodeBackupFactory.build();

      return makeResponse({
        automatic: [mockLinodeBackup],
        snapshot: {
          current: null,
          in_progress: null,
        },
      });
    }
  ),
];

export const shutDownLinode = (mockState: MockState) => [
  http.post(
    '*/v4/linode/instances/:id/shutdown',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Linode>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);

      if (!linode) {
        return makeNotFoundResponse();
      }

      const updatedLinode: Linode = {
        ...linode,
        status: 'offline',
      };

      queueEvents({
        event: {
          action: 'linode_shutdown',
          entity: {
            id: linode.id,
            label: linode.label,
            type: 'linode',
            url: `/v4/linode/instances/${linode.id}`,
          },
        },
        mockState,
        sequence: [
          { status: 'scheduled' },
          { isProgressEvent: true, status: 'started' },
          { status: 'finished' },
        ],
      }).then(async () => {
        await mswDB.update('linodes', id, updatedLinode, mockState);
      });

      return makeResponse(updatedLinode);
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

// TODO: ad more handlers (reboot, clone, resize, rebuild, rescue, migrate...) as needed
