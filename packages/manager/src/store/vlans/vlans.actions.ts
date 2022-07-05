import { VLAN } from '@linode/api-v4';
import { APIError } from '@linode/api-v4';
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
