import { ObjectStorageKey } from '@linode/api-v4/lib/object-storage/types';

export type MODE = 'creating' | 'editing' | 'viewing';

export type OpenAccessDrawer = (
  mode: MODE,
  objectStorageKey?: ObjectStorageKey | null
) => void;
