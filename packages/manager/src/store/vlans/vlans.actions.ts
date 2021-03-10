import { VLAN } from '@linode/api-v4/lib/vlans';
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

export interface VLANConnectionParams {
  vlanID: number;
  linodes: number[];
}
