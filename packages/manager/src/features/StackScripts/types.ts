import { ResourcePage } from '@linode/api-v4';
import { StackScript } from '@linode/api-v4';

export type StackScriptsRequest = (
  params?: unknown,
  filter?: unknown
) => Promise<ResourcePage<StackScript>>;
