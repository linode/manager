import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';
import { GetAllData } from 'src/utilities/getAll';

import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/firewalls`);

export const getFirewalls = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<Firewall[]>,
  APIError[]
>(`success`);
