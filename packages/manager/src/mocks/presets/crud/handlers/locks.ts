/**
 * MSW Handlers for Resource Locks
 *
 * This module provides mock handlers for the Resource Lock API endpoints.
 * Resource locks enable protection of cloud resources from accidental deletion.
 *
 * ## Extending to Other Resource Types
 *
 * To add lock support for a new resource type (e.g., volumes, nodebalancers):
 * Update ENTITY_TYPE_CONFIG below with the new resource type mapping
 *
 */
import { http, HttpResponse } from 'msw';

import { lockFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type {
  APIError,
  CreateLockPayload,
  Entity,
  LockType,
  ResourceLock,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

/**
 * Configuration mapping entity types to their database stores and url
 * Add new resource types here to enable lock support
 */
const ENTITY_TYPE_CONFIG: Record<
  string,
  { store: keyof MockState; url: string }
> = {
  linode: { store: 'linodes', url: 'linodes/instances' },
};

/**
 * Helper function to validate lock creation business rules
 */
const validateLockCreation = async (
  payload: CreateLockPayload,
  mockState: MockState
): Promise<APIError | null> => {
  const { entity_id, entity_type, lock_type } = payload;

  // Check if entity type is supported
  const entityConfig = ENTITY_TYPE_CONFIG[entity_type];
  if (!entityConfig) {
    return { reason: `Unsupported entity type: ${entity_type}` };
  }

  // Check if entity exists and is accessible
  const entities = await mswDB.getAll(entityConfig.store);
  const entity = entities?.find((e: Entity) => e.id === entity_id);
  if (!entity) {
    return { reason: 'The specified entity could not be found.' };
  }

  // Check if entity already has a lock of conflicting type
  const existingLocks = await mswDB.getAll('locks');
  if (existingLocks) {
    const entityLocks = existingLocks.filter(
      (lock) => lock.entity.id === entity_id && lock.entity.type === entity_type
    );

    // Only allow one lock at a time
    if (
      lock_type === 'cannot_delete' ||
      lock_type === 'cannot_delete_with_subresources'
    ) {
      const hasDeleteLock = entityLocks.some(
        (lock) =>
          lock.lock_type === 'cannot_delete' ||
          lock.lock_type === 'cannot_delete_with_subresources'
      );
      if (hasDeleteLock) {
        return {
          field: 'lock_type',
          reason:
            'This resource already has a lock. Only one delete protection lock is allowed at a time.',
        };
      }
    }
  }

  return null;
};

/**
 * Helper function to check if a resource has specific lock types
 */
export const hasResourceLock = async (
  entityId: number | string,
  entityType: string,
  lockTypes: LockType[]
): Promise<boolean> => {
  const locks = await mswDB.getAll('locks');
  if (!locks) return false;

  return locks.some(
    (lock) =>
      lock.entity.id === entityId &&
      lock.entity.type === entityType &&
      lockTypes.includes(lock.lock_type)
  );
};

/**
 * Helper function to get lock information for error messages
 */
export const getLockErrorMessage = async (
  entityId: number | string,
  entityType: string,
  action: 'delete' | 'rebuild'
): Promise<null | string> => {
  const locks = await mswDB.getAll('locks');
  if (!locks) return null;

  const entityLocks = locks.filter(
    (lock) => lock.entity.id === entityId && lock.entity.type === entityType
  );

  for (const lock of entityLocks) {
    if (action === 'delete' || action === 'rebuild') {
      if (
        lock.lock_type === 'cannot_delete' ||
        lock.lock_type === 'cannot_delete_with_subresources'
      ) {
        const actionText = action === 'delete' ? 'deleted' : 'rebuilt';
        return `This ${entityType} is protected by a ${lock.lock_type} lock (Lock ID: ${lock.id}) and cannot be ${actionText}. The lock must be removed by an account administrator.`;
      }
    }
  }

  return null;
};

/**
 * Helper function to check subresource deletion
 */
export const getSubresourceLockError = async (
  entityId: number | string,
  entityType: string,
  subresourceType: string
): Promise<null | string> => {
  const hasSubresourceLock = await hasResourceLock(entityId, entityType, [
    'cannot_delete_with_subresources',
  ]);

  if (hasSubresourceLock) {
    const locks = await mswDB.getAll('locks');
    const lock = locks?.find(
      (lock) =>
        lock.entity.id === entityId &&
        lock.entity.type === entityType &&
        lock.lock_type === 'cannot_delete_with_subresources'
    );

    if (lock) {
      return `This ${subresourceType} is protected by a cannot_delete_with_resource lock (Lock ID: ${lock.id}) on the ${entityType} and cannot be deleted. The lock must be removed by an account administrator.`;
    }
  }

  return null;
};

export const getLocks = (mockState: MockState) => [
  http.get(
    '*/v4beta/locks',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<ResourceLock>>
    > => {
      const locks = await mswDB.getAll('locks');

      if (!locks) {
        return makePaginatedResponse({
          data: [],
          request,
        });
      }

      return makePaginatedResponse({
        data: locks,
        request,
      });
    }
  ),

  http.get(
    '*/v4beta/locks/:lockId',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | ResourceLock>> => {
      const lockId = Number(params.lockId);
      const lock = await mswDB.get('locks', lockId);

      if (!lock) {
        return makeNotFoundResponse();
      }

      return makeResponse(lock);
    }
  ),
];

export const createLock = (mockState: MockState) => [
  http.post(
    '*/v4beta/locks',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | ResourceLock>> => {
      const payload = await request.clone().json();

      // Validate the lock creation
      const validationError = await validateLockCreation(payload, mockState);
      if (validationError) {
        return HttpResponse.json<APIErrorResponse>(
          {
            errors: [
              {
                ...(validationError.field && { field: validationError.field }),
                reason: validationError.reason,
              },
            ],
          },
          { status: 400 }
        );
      }

      // Get entity configuration for URL building
      const entityConfig = ENTITY_TYPE_CONFIG[payload.entity_type];
      const entityUrl = entityConfig
        ? `/v4beta/${entityConfig.url}/${payload.entity_id}`
        : `/v4beta/${payload.entity_type}/${payload.entity_id}`;

      // Create the lock
      const lock = lockFactory.build({
        entity: {
          id: payload.entity_id,
          type: payload.entity_type,
          label: `${payload.entity_type}-${payload.entity_id}`,
          url: entityUrl,
        },
        lock_type: payload.lock_type,
      });

      const createdLock = await mswDB.add('locks', lock, mockState);

      // Queue events
      queueEvents({
        event: {
          action: 'lock_create',
          entity: {
            id: createdLock.id,
            type: 'lock',
            label: '',
            url: '',
          },
          secondary_entity: {
            id: Number(payload.entity_id),
            label: lock.entity.label ?? null,
            type: payload.entity_type,
            url: lock.entity.url ?? '',
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(createdLock);
    }
  ),
];

export const deleteLock = (mockState: MockState) => [
  http.delete(
    '*/v4beta/locks/:lockId',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const lockId = Number(params.lockId);
      const lock = await mswDB.get('locks', lockId);

      if (!lock) {
        return makeNotFoundResponse();
      }

      // Delete the lock
      await mswDB.delete('locks', lockId, mockState);

      // Queue events
      queueEvents({
        event: {
          action: 'lock_delete',
          entity: {
            id: lockId,
            type: 'lock',
            label: '',
            url: '',
          },
          secondary_entity: {
            id: Number(lock.entity.id),
            label: lock.entity.label ?? null,
            type: lock.entity.type,
            url: lock.entity.url ?? '',
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];
