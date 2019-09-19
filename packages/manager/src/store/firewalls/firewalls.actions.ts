import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';

import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/firewalls`);

export const getFirewalls = actionCreator.async<
  void,
  Omit<Linode.ResourcePage<Firewall>, 'page' | 'pages'>,
  APIError[]
>(`success`);
