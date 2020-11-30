import { CreateVLANPayload, VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/vlans`);

export const getVlansActions = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<VLAN>,
  APIError[]
>(`get-all`);

export const createVlanActions = actionCreator.async<
  CreateVLANPayload,
  VLAN,
  APIError[]
>(`create`);

export const deleteVlanActions = actionCreator.async<
  { vlanID: number },
  {},
  APIError[]
>(`delete`);

export interface VLANConnectionParams {
  vlanID: number;
  linodes: number[];
}
export const attachVlanActions = actionCreator.async<
  VLANConnectionParams,
  VLAN,
  APIError[]
>(`attach`);

export const detachVlanActions = actionCreator.async<
  VLANConnectionParams,
  VLAN,
  APIError[]
>(`detach`);
