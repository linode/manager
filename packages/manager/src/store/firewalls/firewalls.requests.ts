import { Firewall, getFirewalls } from 'linode-js-sdk/lib/firewalls';
import { APIError } from 'linode-js-sdk/lib/types';
import { firewalls as mockFirewalls } from 'src/__data__/firewalls';
import { getAll, GetAllData } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getFirewalls as _getFirewallsAction } from './firewalls.actions';

const getAllFirewallsRequest = (payload: { params?: any; filter?: any }) =>
  getAll<Firewall>((passedParams, passedFilter) =>
    getFirewalls(mockFirewalls, passedParams, passedFilter)
  )(payload.params, payload.filter);

export const getAllFirewalls = createRequestThunk<
  | {
      params?: any;
      filter?: any;
    }
  | undefined,
  GetAllData<Firewall[]>,
  APIError[]
>(_getFirewallsAction, getAllFirewallsRequest);
