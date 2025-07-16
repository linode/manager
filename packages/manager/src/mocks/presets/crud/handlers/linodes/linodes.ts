import {
  configFactory,
  linodeBackupFactory,
  linodeFactory,
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVlan,
  linodeInterfaceFactoryVPC,
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

import { mswDB } from '../../../../indexedDB';

import type {
  CreateLinodeInterfacePayload,
  Disk,
  Firewall,
  FirewallDeviceEntityType,
  Linode,
  LinodeBackupsResponse,
  LinodeIPsResponse,
  RegionalNetworkUtilization,
  Stats,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getLinodes = () => [
  http.get(
    '*/v4*/linode/instances',
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
    '*/v4*/linode/instances/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Linode>> => {
      const id = Number(params.id);
      const linode = await mswDB.get('linodes', id);

      if (!linode) {
        return makeNotFoundResponse();
      }

      return makeResponse(linode);
    }
  ),
];

export const addFirewallDevice = async (inputs: {
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
  http.post('*/v4*/linode/instances', async ({ request }) => {
    const payload = await request.clone().json();
    const payloadCopy = { ...payload };

    // Ensure linode object does not have `interfaces` property
    delete payloadCopy['interfaces'];

    // TODO: Get region capabilities. We can remove this once it's available in all regions
    const region = await mswDB.get('regions', payload.region);
    const regionSupportsMaintenancePolicy =
      region?.capabilities?.includes('Maintenance Policy') ?? false;

    const linode = linodeFactory.build({
      created: DateTime.now().toISO(),
      status: 'provisioning',
      ...(regionSupportsMaintenancePolicy
        ? { maintenance_policy: payload.maintenance_policy ?? 'linode/migrate' }
        : {}),
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

          const createdVPCInterface = await mswDB.add(
            'linodeInterfaces',
            [linode.id, vpcInterface],
            mockState
          );

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
                    id: createdVPCInterface[1].id,
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

          // if firewall given in interface payload, add a device
          if (vpcIfacePayload.firewall_id) {
            await addFirewallDevice({
              entityId: vpcInterface.id,
              entityLabel: linode.label,
              firewallId: vpcIfacePayload.firewall_id,
              interfaceType: 'linode_interface',
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
            interfaceType: 'linode_interface',
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
      // TODO UPDATE THIS
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

// TODO: ad more handlers (reboot, clone, resize, rebuild, rescue, migrate...) as needed
