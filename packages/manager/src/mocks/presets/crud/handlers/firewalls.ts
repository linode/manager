import { DateTime } from 'luxon';
import { http } from 'msw';

import { firewallFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { Firewall } from '@linode/api-v4';
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
];

export const createFirewall = (mockState: MockState) => [
  http.post(
    '*/v4beta/networking/firewalls',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | Firewall>> => {
      const payload = await request.clone().json();

      const firewall = firewallFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('firewalls', firewall, mockState);

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
      const updatedDomain = { ...firewall, ...payload };

      await mswDB.update('firewalls', id, updatedDomain, mockState);

      queueEvents({
        event: {
          action: 'firewall_update',
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

      return makeResponse(updatedDomain);
    }
  ),
];

export const deleteFirewall = (mockState: MockState) => [
  http.delete(
    '*/v4beta/networking/firewalls/:id',
    async ({ params }): Promise<StrictResponse<{} | APIErrorResponse>> => {
      const id = Number(params.id);
      const firewall = await mswDB.get('firewalls', id);

      if (!firewall) {
        return makeNotFoundResponse();
      }

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

export const getFirewallSettings = (mockState: MockState) => [];

export const updateFirewallSettings = (mockState: MockState) => [];

export const getFirewallDevices = (mockState: MockState) => [];

export const createFirewallDevices = (mockState: MockState) => [];
