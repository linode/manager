import { VLAN } from '@linode/api-v4/lib/vlans';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import {
  createVLAN as _create,
  deleteVLAN as _delete,
  getAllVLANs as _getVLANs
} from 'src/store/vlans/vlans.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  getVLANs: (params?: any, filters?: any) => Promise<GetAllData<VLAN>>;
  deleteVLAN: (vlanID: number) => Promise<{}>;
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
      getVLANs: (params, filter) => dispatch(_getVLANs({ params, filter })),
      deleteVLAN: (vlanID: number) => dispatch(_delete({ vlanID }))
    })
  );

export default connected;
