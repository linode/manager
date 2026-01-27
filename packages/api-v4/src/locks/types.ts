import type { EntityType } from '../entities';

/**
 * Types of locks that can be applied to a resource
 */
export type LockType = 'cannot_delete' | 'cannot_delete_with_subresources';

/**
 * Entity information attached to a lock
 */
export interface LockEntity {
  id: number | string;
  label?: string;
  type: EntityType;
  url?: string;
}

/**
 * Request payload for creating a lock
 * POST /v4beta/locks
 */
export interface CreateLockPayload {
  /** Required: ID of the entity being locked */
  entity_id: number | string;
  /** Required: Type of the entity being locked */
  entity_type: EntityType;
  /** Required: Type of lock to apply */
  lock_type: LockType;
}

/**
 * Resource Lock object returned from API
 * Response from POST /v4beta/locks
 */
export interface ResourceLock {
  /** Information about the locked entity */
  entity: LockEntity;
  /** Unique identifier for the lock */
  id: number;
  /** Type of lock applied */
  lock_type: LockType;
}
