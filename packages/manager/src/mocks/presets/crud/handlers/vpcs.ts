import { DateTime } from 'luxon';
import { http } from 'msw';

import { vpcFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { Subnet, VPC } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getVPCs = () => [
  http.get(
    '*/v4/vpcs',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<VPC>>
    > => {
      const vpcs = await mswDB.getAll('vpcs');

      if (!vpcs) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: vpcs,
        request,
      });
    }
  ),

  http.get(
    '*/v4/vpcs/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      return makeResponse(vpc);
    }
  ),

  http.get(
    '*/v4/vpcs/:id/subnets',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Subnet>>
    > => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);
      const subnetsFromDB = await mswDB.getAll('subnets');

      if (!vpc || !subnetsFromDB) {
        return makeNotFoundResponse();
      }

      const subnets = subnetsFromDB
        .filter((subnetTuple) => subnetTuple[0] === id)
        .map((subnetTuple) => subnetTuple[1]);

      return makePaginatedResponse({
        data: subnets,
        request,
      });
    }
  ),

  http.get(
    '*/v4/vpcs/:id/subnets/:subnetId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Subnet>> => {
      const id = Number(params.id);
      const subnetId = Number(params.subnetId);
      const vpc = await mswDB.get('vpcs', id);
      const subnet = await mswDB.get('subnets', subnetId);

      if (!vpc || !subnet) {
        return makeNotFoundResponse();
      }

      return makeResponse(subnet[1]);
    }
  ),
];

export const createVPC = (mockState: MockState) => [
  http.post(
    '*/v4/vpcs',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const payload = await request.clone().json();

      const vpc = vpcFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        entities: [],
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('vpcs', vpc, mockState);

      queueEvents({
        event: {
          action: 'vpc_create',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'vpc',
            url: `/v4/vpcs/${vpc.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(vpc);
    }
  ),
];

export const updateVPC = (mockState: MockState) => [
  http.put(
    '*/v4/vpcs/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | VPC>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };
      const updatedVPC = { ...vpc, ...payload };

      await mswDB.update('vpcs', id, updatedVPC, mockState);

      queueEvents({
        event: {
          action: 'vpc_update',
          entity: {
            id: updatedVPC.id,
            label: updatedVPC.label,
            type: 'vpc',
            url: `/v4/vpcs/${updatedVPC.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedVPC);
    }
  ),
];

export const deleteVPC = (mockState: MockState) => [
  http.delete(
    '*/v4/vpcs/:id',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
      const id = Number(params.id);
      const vpc = await mswDB.get('vpcs', id);

      if (!vpc) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('vpcs', id, mockState);

      queueEvents({
        event: {
          action: 'vpc_delete',
          entity: {
            id: vpc.id,
            label: vpc.label,
            type: 'vpc',
            url: `/v4/vpc/${vpc.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];

export const createSubnet = (mockState: MockState) => [
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
        label: `linode-${payload.id}`,
        url: `/linodes/${payload.id}`,
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
            url: `/v4beta/networking/firewalls/${firewallId}/linodes`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(firewallDevice);
    }
  ),
];

export const updateSubnet = (mockState: MockState) => [
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
        label: `linode-${payload.id}`,
        url: `/linodes/${payload.id}`,
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
            url: `/v4beta/networking/firewalls/${firewallId}/linodes`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(firewallDevice);
    }
  ),
];

export const deleteSubnet = (mockState: MockState) => [
  http.delete(
    '*/v4beta/networking/firewalls/:id/devices/:deviceId',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
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
            url: `/v4beta/networking/firewalls/${firewall.id}/linodes`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];