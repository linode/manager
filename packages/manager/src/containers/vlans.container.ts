import { VLAN } from '@linode/api-v4/lib/vlans';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import {
  createVlan as _create,
  deleteVlan as _delete,
  getAllVlans as _getVLANs
} from 'src/store/vlans/vlans.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  getVlans: (params?: any, filters?: any) => Promise<GetAllData<VLAN>>;
  deleteVlan: (vlanID: number) => Promise<{}>;
}

/* tslint:disable-next-line */
export type StateProps = State;

export type Props = DispatchProps & StateProps;

const connected = <ReduxStateProps extends {}, OwnProps extends {}>(
  mapAccountToProps?: (
    ownProps: OwnProps,
    state: StateProps
  ) => ReduxStateProps & Partial<StateProps>
) =>
  connect<
    ReduxStateProps | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      if (mapAccountToProps) {
        return mapAccountToProps(ownProps, state.vlans);
      }

      return state.vlans;
    },
    (dispatch: ThunkDispatch) => ({
      getVlans: (params, filter) => dispatch(_getVLANs({ params, filter })),
      deleteVlan: (vlanID: number) => dispatch(_delete({ vlanID }))
    })
  );

export default connected;
