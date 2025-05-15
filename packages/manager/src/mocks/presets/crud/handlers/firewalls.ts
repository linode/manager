import { DateTime } from 'luxon';
import { http } from 'msw';

import {
  firewallDeviceFactory,
  firewallFactory,
  firewallSettingsFactory,
  firewallTemplateFactory,
} from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  Firewall,
  FirewallDevice,
  FirewallDeviceEntity,
  FirewallDeviceEntityType,
  FirewallRules,
  FirewallSettings,
  FirewallTemplate,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getFirewalls = (mockState: MockState) => [
  http.get(
    '*/v4beta/networking/firewalls',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Firewall>> => {
      return makePaginatedResponse({
        data: mockState.firewalls,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/networking/firewalls/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | Firewall>> => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);

      if (!firewall) {
        return makeNotFoundResponse();
      }

      return makeResponse(firewall);
    }
  ),

  http.get(
    '*/v4beta/networking/firewalls/:id/devices',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<FirewallDevice>>
    > => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);
      const firewallDevices = await mswDB.getAll('firewallDevices');

      if (!firewall || !firewallDevices) {
        return makeNotFoundResponse();
      }

      const devices = firewallDevices
        .filter((deviceTuple) => deviceTuple[0] === id)
        .map((deviceTuple) => deviceTuple[1]);

      return makePaginatedResponse({
        data: devices,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/networking/firewalls/:id/devices/:deviceId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | FirewallDevice>> => {
      const id = Number(params.id);
      const deviceId = Number(params.deviceId);
      const firewall = await mswDB.get('firewalls', id);
      const firewallDevice = await mswDB.get('firewallDevices', deviceId);

      if (!firewall || !firewallDevice) {
        return makeNotFoundResponse();
      }

      return makeResponse(firewallDevice[1]);
    }
  ),
];

export const createFirewall = (mockState: MockState) => [
  http.post(
    '*/v4beta/networking/firewalls',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | Firewall>> => {
      const payload = await request.clone().json();

      const firewallEntities: FirewallDeviceEntity[] = [];
      const createDevicePromises = [];

      const firewall = firewallFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        entities: [],
        updated: DateTime.now().toISO(),
      });

      if (payload.devices?.linodes) {
        for (const linodeId of payload.devices?.linodes as number[]) {
          const entity = {
            id: linodeId,
            label: `linode-${linodeId}`,
            type: 'linode' as FirewallDeviceEntityType,
            url: `/linodes/${linodeId}`,
          };
          firewallEntities.push(entity);

          const firewallDevice = firewallDeviceFactory.build({
            created: DateTime.now().toISO(),
            entity,
            updated: DateTime.now().toISO(),
          });

          createDevicePromises.push(
            mswDB.add(
              'firewallDevices',
              [firewall.id, firewallDevice],
              mockState
            )
          );
        }
      }
      if (payload.devices?.nodebalancers) {
        for (const nbId of payload.devices?.nodebalancers as number[]) {
          const entity = {
            id: nbId,
            label: `nodebalancer-${nbId}`,
            type: 'nodebalancer' as FirewallDeviceEntityType,
            url: `/nodebalancers/${nbId}`,
          };
          firewallEntities.push(entity);

          const firewallDevice = firewallDeviceFactory.build({
            created: DateTime.now().toISO(),
            entity,
            updated: DateTime.now().toISO(),
          });

          createDevicePromises.push(
            mswDB.add(
              'firewallDevices',
              [firewall.id, firewallDevice],
              mockState
            )
          );
        }
      }

      await Promise.all(createDevicePromises);
      await mswDB.add(
        'firewalls',
        { ...firewall, entities: firewallEntities },
        mockState
      );

      queueEvents({
        event: {
          action: 'firewall_create',
          entity: {
            id: firewall.id,
            label: firewall.label,
            type: 'firewall',
            url: `/v4beta/networking/firewalls/${firewall.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(firewall);
    }
  ),
];

export const updateFirewall = (mockState: MockState) => [
  http.put(
    '*/v4beta/networking/firewalls/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Firewall>> => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);

      if (!firewall) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };
      const updatedFirewall = { ...firewall, ...payload };

      await mswDB.update('firewalls', id, updatedFirewall, mockState);

      queueEvents({
        event: {
          action: 'firewall_update',
          entity: {
            id: firewall.id,
            label: updatedFirewall.label,
            type: 'firewall',
            url: `/v4beta/networking/firewalls/${firewall.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedFirewall);
    }
  ),
];

export const deleteFirewall = (mockState: MockState) => [
  http.delete(
    '*/v4beta/networking/firewalls/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);

      if (!firewall) {
        return makeNotFoundResponse();
      }

      const firewallDevices = await mswDB.getAll('firewallDevices');
      const deleteDevicePromises = [];

      if (firewallDevices) {
        const devices = firewallDevices
          .filter((deviceTuple) => deviceTuple[0] === id)
          .map((deviceTuple) => deviceTuple[1]);
        for (const device of devices) {
          deleteDevicePromises.push(
            mswDB.delete('firewallDevices', device.id, mockState)
          );
        }
      }

      await Promise.all(deleteDevicePromises);
      await mswDB.delete('firewalls', id, mockState);

      queueEvents({
        event: {
          action: 'firewall_delete',
          entity: {
            id: firewall.id,
            label: firewall.label,
            type: 'firewall',
            url: `/v4beta/networking/firewalls/${firewall.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const updateFirewallRules = (mockState: MockState) => [
  http.put(
    '*/v4beta/networking/firewalls/:id/rules',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | FirewallRules>> => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);

      if (!firewall) {
        return makeNotFoundResponse();
      }

      const payload: FirewallRules = {
        ...(await request.clone().json()),
      };
      const updatedRules = { ...firewall.rules, ...payload };
      const updatedFirewall = {
        ...firewall,
        rules: updatedRules,
      };

      await mswDB.update('firewalls', id, updatedFirewall, mockState);

      queueEvents({
        event: {
          action: 'firewall_rules_update',
          entity: {
            id: firewall.id,
            label: firewall.label,
            type: 'firewall',
            url: `/v4beta/networking/firewalls/${firewall.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedRules);
    }
  ),
];

export const createFirewallDevice = (mockState: MockState) => [
  http.post(
    '*/v4beta/networking/firewalls/:id/devices',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | FirewallDevice>> => {
      const firewallId = Number(params.id);
      const firewall = await mswDB.get('firewalls', firewallId);

      if (!firewall) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const entity = {
        ...payload,
        label: `${payload.type}-${payload.id}`,
        url: `/v4beta/${payload.type}s/${payload.id}`,
      };

      const firewallDevice = firewallDeviceFactory.build({
        created: DateTime.now().toISO(),
        entity,
        updated: DateTime.now().toISO(),
      });

      const updatedFirewall = {
        ...firewall,
        entities: [...firewall.entities, entity],
      };

      await mswDB.add(
        'firewallDevices',
        [firewallId, firewallDevice],
        mockState
      );

      await mswDB.update('firewalls', firewallId, updatedFirewall, mockState);

      queueEvents({
        event: {
          action: 'firewall_device_add',
          entity: {
            id: firewallId,
            label: firewall.label,
            type: 'firewallDevice',
            url: `/v4beta/networking/firewalls/${firewallId}/${payload.type}s`,
          },
          secondary_entity: {
            ...entity,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(firewallDevice);
    }
  ),
];

export const deleteFirewallDevice = (mockState: MockState) => [
  http.delete(
    '*/v4beta/networking/firewalls/:id/devices/:deviceId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const firewallId = Number(params.id);
      const deviceId = Number(params.deviceId);
      const firewall = await mswDB.get('firewalls', firewallId);
      const firewallDevice = await mswDB.get('firewallDevices', deviceId);

      if (!firewall || !firewallDevice) {
        return makeNotFoundResponse();
      }
      const updatedFirewall = {
        ...firewall,
        entities: firewall.entities.filter(
          (entity) => entity.id !== firewallDevice[1].entity.id
        ),
      };

      await mswDB.delete('firewallDevices', deviceId, mockState);
      await mswDB.update('firewalls', firewallId, updatedFirewall, mockState);

      queueEvents({
        event: {
          action: 'firewall_device_remove',
          entity: {
            id: firewall.id,
            label: firewall.label,
            type: 'firewallDevice',
            url: `/v4beta/networking/firewalls/${firewall.id}`,
          },
          secondary_entity: {
            ...firewallDevice[1].entity,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

// todo: integrate with db if needed
export const getFirewallTemplates = () => [
  http.get(
    '*/v4beta/networking/firewalls/templates',
    ({
      request,
    }): StrictResponse<
      APIErrorResponse | APIPaginatedResponse<FirewallTemplate>
    > => {
      const templates = firewallTemplateFactory.buildList(3);
      return makePaginatedResponse({
        data: templates,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/networking/firewalls/templates/:slug',
    async (): Promise<StrictResponse<APIErrorResponse | FirewallTemplate>> => {
      const firewallTemplate = firewallTemplateFactory.build();

      return makeResponse(firewallTemplate);
    }
  ),
];

// todo: integrate with db if needed
export const getFirewallSettings = () => [
  http.get(
    '*/v4beta/networking/firewalls/settings',
    async (): Promise<StrictResponse<APIErrorResponse | FirewallSettings>> => {
      const firewallSettings = firewallSettingsFactory.build();

      return makeResponse(firewallSettings);
    }
  ),
];

// todo: integrate with db if needed
export const updateFirewallSettings = () => [
  http.put(
    '*/v4beta/networking/firewalls/settings',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | FirewallSettings>> => {
      const payload = await request.clone().json();
      const firewallSettings = firewallSettingsFactory.build({
        ...payload,
      });

      return makeResponse(firewallSettings);
    }
  ),
];
