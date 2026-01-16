import { http } from 'msw';

import { lockFactory } from 'src/factories';
import { queueEvents } from 'src/mocks/utilities/events';
import {
  makeErrorResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { CreateLockPayload, LockType, ResourceLock } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

/**
 * Helper function to validate lock creation business rules
 */
const validateLockCreation = async (
  payload: CreateLockPayload,
  mockState: MockState
): Promise<null | string> => {
  const { entity_id, entity_type, lock_type } = payload;

  // Check if entity exists and is accessible
  if (entity_type === 'linode') {
    const linodes = await mswDB.getAll('linodes');
    const linode = linodes?.find((l) => l.id === entity_id);
    if (!linode) {
      return 'The specified entity could not be found.';
    }
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
        return 'This resource already has a lock. Only one delete protection lock is allowed at a time.';
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
        return makeErrorResponse(validationError, 400);
      }

      // Create the lock
      const lock = lockFactory.build({
        entity: {
          id: payload.entity_id,
          type: payload.entity_type,
          label: `${payload.entity_type}-${payload.entity_id}`,
          url: `/v4beta/linodes/instances/${payload.entity_id}`,
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
            label: `Lock ${createdLock.id}`,
            type: 'linode',
            url: `/v4beta/locks/${createdLock.id}`,
          },
          secondary_entity: {
            id: Number(payload.entity_id),
            label: lock.entity.label || '',
            type: payload.entity_type,
            url: lock.entity.url || '',
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
            label: `Lock ${lockId}`,
            type: 'linode',
            url: `/v4beta/locks/${lockId}`,
          },
          secondary_entity: {
            id: Number(lock.entity.id),
            label: lock.entity.label || '',
            type: lock.entity.type,
            url: lock.entity.url || '',
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse({});
    }
  ),
];
