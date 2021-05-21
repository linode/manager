import { ResourcePage } from '@linode/api-v4/lib/types';
import { StackScript } from '@linode/api-v4/lib/stackscripts';

export type StackScriptsRequest = (
  params?: unknown,
  filter?: unknown
) => Promise<ResourcePage<StackScript>>;
