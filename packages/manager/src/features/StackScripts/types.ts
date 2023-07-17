import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';

export type StackScriptsRequest = (
  params?: unknown,
  filter?: unknown
) => Promise<ResourcePage<StackScript>>;
