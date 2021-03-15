import { Grant } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { StackScript } from '@linode/api-v4/lib/stackscripts';

export type StackScriptsRequest = (
  username: string,
  params?: unknown,
  filter?: unknown,
  stackScriptGrants?: Grant[]
) => Promise<ResourcePage<StackScript>>;
