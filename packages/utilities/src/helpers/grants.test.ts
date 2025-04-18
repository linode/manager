import { describe, expect, it } from 'vitest';

import { grantsFactory } from '../factories';
import { getEntityIdsByPermission } from './grants';

const grants = grantsFactory.build({
  linode: [
    { id: 0, permissions: 'read_only' },
    { id: 1, permissions: 'read_write' },
    { id: 2, permissions: 'read_only' },
    { id: 3, permissions: null },
  ],
});

describe('getEntityIdsByPermission', () => {
  it('should return an empty array when there is no grant data', () => {
    expect(getEntityIdsByPermission(undefined, 'linode', 'read_write')).toEqual(
      [],
    );
  });
  it('should return read-only entity ids with read_only permission', () => {
    expect(getEntityIdsByPermission(grants, 'linode', 'read_only')).toEqual([
      0, 2,
    ]);
  });
  it('should return all entity ids if a permission level is omitted', () => {
    expect(getEntityIdsByPermission(grants, 'linode')).toEqual([0, 1, 2, 3]);
  });
});
