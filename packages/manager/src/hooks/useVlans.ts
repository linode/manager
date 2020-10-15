import { VLAN } from '@linode/api-v4/lib/vlans/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import {
  getAllVlans as _request,
  connectVlan as _connect,
  disconnectVlan as _disconnect
} from 'src/store/vlans/vlans.requests';
import { Dispatch } from './types';

export interface NodeBalancersProps {
  vlans: State;
  requestVLANs: () => Promise<VLAN[]>;
  disconnectVlan: (vlanID: number, linodes: number[]) => Promise<VLAN>;
  connectVlan: (vlanID: number, linodes: number[]) => Promise<VLAN>;
}

export const useVlans = () => {
  const dispatch: Dispatch = useDispatch();
  const vlans = useSelector(
    (state: ApplicationState) => state.__resources.vlans
  );
  const requestVLANs = () => dispatch(_request({}));
  const disconnectVlan = (vlanID: number, linodes: number[]) =>
    dispatch(_disconnect({ vlanID, linodes }));

  const connectVlan = (vlanID: number, linodes: number[]) =>
    dispatch(_connect({ vlanID, linodes }));

  return { vlans, requestVLANs, connectVlan, disconnectVlan };
};

export default useVlans;
