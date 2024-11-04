import type { ResourcePage, StackScript } from '@linode/api-v4';

export type StackScriptsRequest = (
  params?: unknown,
  filter?: unknown
) => Promise<ResourcePage<StackScript>>;
