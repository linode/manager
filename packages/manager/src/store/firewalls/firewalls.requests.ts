import { Firewall, getFirewalls } from 'linode-js-sdk/lib/firewalls';
import { firewalls as mockFirewalls } from 'src/__data__/firewalls';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getFirewalls as _getFirewallsAction } from './firewalls.actions';

/*
 * Get All Buckets
 */
const getAllFirewallsRequest = () =>
  getAll<Firewall>((params, filters) =>
    getFirewalls(mockFirewalls, params, filters)
  )();

export const getAllFirewalls = createRequestThunk(
  _getFirewallsAction,
  getAllFirewallsRequest
);
