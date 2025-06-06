import {
  configFactory,
  linodeBackupFactory,
  linodeFactory,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
  linodeInterfaceSettingsFactory,
  linodeIPFactory,
  linodeStatsFactory,
  linodeTransferFactory,
} from '@linode/utilities';
import { DateTime } from 'luxon';
import { http } from 'msw';

import { firewallDeviceFactory, linodeDiskFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  Config,
  CreateLinodeInterfacePayload,
  Disk,
  Firewall,
  FirewallDeviceEntityType,
  InterfaceGenerationType,
  Linode,
  LinodeBackupsResponse,
  LinodeInterface,
  LinodeInterfaces,
  LinodeInterfaceSettings,
  LinodeIPsResponse,
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

const addFirewallDevice = async (inputs: {
  entityId: number;
  entityLabel: string;
  firewallId: number;
  interfaceType: FirewallDeviceEntityType;
  mockState: MockState;
}) => {
  const { entityId, entityLabel, firewallId, interfaceType, mockState } =
    inputs;
  const firewall = await mswDB.get('firewalls', firewallId);
  if (firewall) {
    const entity = {
      id: entityId,
      label: entityLabel,
      type: interfaceType,
      url: `/linodes/${entityId}`,
      parent_entity: null,
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

    await mswDB.update('firewalls', firewall.id, updatedFirewall, mockState);

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
};

export const createLinode = (mockState: MockState) => [
  http.post('*/v4/linode/instances', async ({ request }) => {
    const payload = await request.clone().json();
    const payloadCopy = { ...payload };

    // Ensure linode object does not have `interfaces` property
    delete payloadCopy['interfaces'];

    const linode = linodeFactory.build({
      created: DateTime.now().toISO(),
      status: 'provisioning',
      ...payloadCopy,
    });

    if (!linode.label) {
      linode.label = `linode${linode.id}`;
    }

    if (payload.firewall_id) {
      await addFirewallDevice({
        entityId: linode.id,
        entityLabel: linode.label,
        firewallId: payload.firewall_id,
        interfaceType: 'linode',
        mockState,
      });
    }

    await mswDB.add('linodes', linode, mockState);
    if (linode.interface_generation === 'linode') {
      if (
        payload.interfaces &&
        payload.interfaces.some(
          (iface: CreateLinodeInterfacePayload) => iface.vpc
        )
      ) {
        const vpcIfacePayload = payload.interfaces.find(
          (iface: CreateLinodeInterfacePayload) => iface.vpc
        );

        const subnetFromDB = await mswDB.get(
          'subnets',
          vpcIfacePayload.vpc.subnet_id ?? -1
        );
        const vpc = await mswDB.get(
          'vpcs',
          vpcIfacePayload.vpc.vpc_id ?? subnetFromDB?.[0] ?? -1
        );

        if (subnetFromDB && vpc) {
          const vpcInterface = linodeInterfaceFactoryVPC.build({
            ...vpcIfacePayload,
            default_route: {
              ipv4: true,
            },
            created: DateTime.now().toISO(),
            updated: DateTime.now().toISO(),
          });

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
                    id: vpcInterface.id,
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

          await mswDB.add(
            'linodeInterfaces',
            [linode.id, vpcInterface],
            mockState
          );
          await mswDB.update(
            'subnets',
            subnetFromDB[1].id,
            [vpc.id, updatedSubnet],
            mockState
          );
          await mswDB.update('vpcs', vpc.id, updatedVPC, mockState);

          // if firewall given in interface payload, add a device
          if (vpcIfacePayload.firewall_id) {
            await addFirewallDevice({
              entityId: vpcInterface.id,
              entityLabel: linode.label,
              firewallId: vpcIfacePayload.firewall_id,
              interfaceType: 'interface',
              mockState,
            });
          }
        }
      }

      if (
        payload.interfaces &&
        payload.interfaces.some(
          (iface: CreateLinodeInterfacePayload) => iface.public
        )
      ) {
        const publicInterface = linodeInterfaceFactoryPublic.build({
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
        await mswDB.add(
          'linodeInterfaces',
          [linode.id, publicInterface],
          mockState
        );

        // if firewall given in interface payload, add a device
        const interfacePayload = payload.interfaces.find(
          (iface: CreateLinodeInterfacePayload) => iface.public
        );
        if (interfacePayload.firewall_id) {
          await addFirewallDevice({
            entityId: publicInterface.id,
            entityLabel: linode.label,
            firewallId: interfacePayload.firewall_id,
            interfaceType: 'interface',
            mockState,
          });
        }
      }

      if (
        payload.interfaces &&
        payload.interfaces.some(
          (iface: CreateLinodeInterfacePayload) => iface.vlan
        )
      ) {
        const vlanInterface = linodeInterfaceFactoryVlan.build({
          created: DateTime.now().toISO(),
          updated: DateTime.now().toISO(),
        });
        await mswDB.add(
          'linodeInterfaces',
          [linode.id, vlanInterface],
          mockState
        );
      }
    } else {
      const linodeConfig = configFactory.build({
        created: DateTime.now().toISO(),
      });
      await mswDB.add('linodeConfigs', [linode.id, linodeConfig], mockState);
    }

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

      await mswDB.add(
        'linodeInterfaces',
        [linodeId, linodeInterface],
        mockState
      );

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

// TODO: ad more handlers (reboot, clone, resize, rebuild, rescue, migrate...) as needed
