import { ObjectStorageKey } from '@linode/api-v4';

export type MODE = 'creating' | 'editing' | 'viewing';

export type OpenAccessDrawer = (
  mode: MODE,
  objectStorageKey?: ObjectStorageKey | null
) => void;
