import { DateTime } from 'luxon';
import { http } from 'msw';

import { domainFactory, domainRecordFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { Domain, DomainRecord } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getDomains = () => [
  http.get(
    '*/v4/domains/:id/records',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<DomainRecord>>
    > => {
      const domainRecords = domainRecordFactory.buildList(3);

      return makePaginatedResponse({
        data: domainRecords,
        request,
      });
    }
  ),

  http.get(
    '*/v4/domains',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Domain>>
    > => {
      const domains = await mswDB.getAll('domains');

      if (!domains) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: domains,
        request,
      });
    }
  ),

  http.get(
    '*/v4/domains/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Domain>> => {
      const id = Number(params.id);
      const domain = await mswDB.get('domains', id);

      if (!domain) {
        return makeNotFoundResponse();
      }

      return makeResponse(domain);
    }
  ),
];

export const createDomain = (mockState: MockState) => [
  http.post(
    '*/v4/domains',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | Domain>> => {
      const payload = await request.clone().json();

      const domain = domainFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        last_updated: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('domains', domain, mockState);

      queueEvents({
        event: {
          action: 'domain_create',
          entity: {
            id: domain.id,
            label: domain.domain,
            type: 'domain',
            url: `/v4/domains/${domain.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(domain);
    }
  ),
];

export const updateDomain = (mockState: MockState) => [
  http.put(
    '*/v4/domains/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Domain>> => {
      const id = Number(params.id);
      const domain = await mswDB.get('domains', id);

      if (!domain) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        last_updated: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      };
      const updatedDomain = { ...domain, ...payload };

      await mswDB.update('domains', id, updatedDomain, mockState);

      queueEvents({
        event: {
          action: 'domain_update',
          entity: {
            id: domain.id,
            label: domain.domain,
            type: 'domain',
            url: `/v4/domains/${domain.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(updatedDomain);
    }
  ),
];

export const cloneDomain = (mockState: MockState) => [
  http.post(
    '*/v4/domains/:id/clone',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Domain>> => {
      const id = Number(params.id);
      const domain = await mswDB.get('domains', id);

      if (!domain) {
        return makeNotFoundResponse();
      }

      const clonedDomain = {
        ...domain,
        created: DateTime.now().toISO(),
        last_updated: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      };

      await mswDB.add('domains', clonedDomain, mockState);

      queueEvents({
        event: {
          action: 'domain_create',
          entity: {
            id: domain.id,
            label: domain.domain,
            type: 'domain',
            url: `/v4/domains/${domain.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(domain);
    }
  ),
];

export const importDomain = (mockState: MockState) => [
  http.post(
    '*/v4/domains/import',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | Domain>> => {
      const payload = await request.clone().json();

      const domain = domainFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
        last_updated: DateTime.now().toISO(),
        updated: DateTime.now().toISO(),
      });

      await mswDB.add('domains', domain, mockState);

      queueEvents({
        event: {
          action: 'domain_create',
          entity: {
            id: domain.id,
            label: domain.domain,
            type: 'domain',
            url: `/v4/domains/${domain.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(domain);
    }
  ),
];

export const deleteDomains = (mockState: MockState) => [
  http.delete(
    '*/v4/domains/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const domain = await mswDB.get('domains', id);

      if (!domain) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('domains', id, mockState);

      queueEvents({
        event: {
          action: 'domain_delete',
          entity: {
            id: domain.id,
            label: domain.domain,
            type: 'domain',
            url: `/v4/domains/${domain.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];
