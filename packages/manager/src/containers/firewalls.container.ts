import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/firewalls/firewalls.reducer';
import { getAllFirewalls as _getFirewalls } from 'src/store/firewalls/firewalls.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

interface DispatchProps {
  getFirewalls: (params: any, filters: any) => Promise<GetAllData<Firewall[]>>;
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
        return mapAccountToProps(ownProps, state.firewalls);
      }

      return state.firewalls;
    },
    (dispatch: ThunkDispatch) => ({
      getFirewalls: (params, filter) =>
        dispatch(_getFirewalls({ params, filter }))
    })
  );

export default connected;
