import {
  CreateFirewallPayload,
  Firewall,
  FirewallRules,
  UpdateFirewallPayload,
} from '@linode/api-v4/lib/firewalls';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/firewalls`);

export const getFirewalls = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<Firewall>,
  APIError[]
>(`get-all`);

export const createFirewallActions = actionCreator.async<
  CreateFirewallPayload,
  Firewall,
  APIError[]
>(`create`);

export type UpdateFirewallPayloadWithID = UpdateFirewallPayload & {
  firewallID: number;
};
export const updateFirewallActions = actionCreator.async<
  UpdateFirewallPayloadWithID,
  Firewall,
  APIError[]
>(`update`);

export type UpdateFirewallRulesPayloadWithID = FirewallRules & {
  firewallID: number;
};
export const updateFirewallRulesActions = actionCreator.async<
  UpdateFirewallRulesPayloadWithID,
  FirewallRules,
  APIError[]
>(`update-rules`);

export const deleteFirewallActions = actionCreator.async<
  { firewallID: number },
  {},
  APIError[]
>(`delete`);
