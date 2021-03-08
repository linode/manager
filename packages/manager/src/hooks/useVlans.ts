import { VLAN } from '@linode/api-v4/lib/vlans/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import { getAllVlans as _request } from 'src/store/vlans/vlans.requests';
import { Dispatch } from './types';

export interface VlansProps {
  vlans: State;
  requestVLANs: () => Promise<VLAN[]>;
  attachVlan: (vlanID: number, linodes: number[]) => Promise<VLAN>;
}

export const useVlans = () => {
  const dispatch: Dispatch = useDispatch();
  const vlans = useSelector(
    (state: ApplicationState) => state.__resources.vlans
  );
  const requestVLANs = () => dispatch(_request({}));

  return {
    vlans,
    requestVLANs,
  };
};

export default useVlans;
