import { CreateFirewallPayload, Firewall } from 'linode-js-sdk/lib/firewalls';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { UpdateFirewallPayloadWithID } from 'src/store/firewalls/firewalls.actions';
import { State } from 'src/store/firewalls/firewalls.reducer';
import {
  createFirewall as _create,
  deleteFirewall as _delete,
  disableFirewall as _disable,
  enableFirewall as _enable,
  getAllFirewalls as _getFirewalls,
  updateFirewall as _update
} from 'src/store/firewalls/firewalls.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  getFirewalls: (
    params?: any,
    filters?: any
  ) => Promise<GetAllData<Firewall[]>>;
  createFirewall: (payload: CreateFirewallPayload) => Promise<Firewall>;
  deleteFirewall: (firewallID: number) => Promise<{}>;
  disableFirewall: (firewallID: number) => Promise<Firewall>;
  enableFirewall: (firewallID: number) => Promise<Firewall>;
  updateFirewall: (payload: UpdateFirewallPayloadWithID) => Promise<Firewall>;
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
        dispatch(_getFirewalls({ params, filter })),
      createFirewall: payload => dispatch(_create(payload)),
      deleteFirewall: (firewallID: number) => dispatch(_delete({ firewallID })),
      disableFirewall: (firewallID: number) =>
        dispatch(_disable({ firewallID })),
      enableFirewall: (firewallID: number) => dispatch(_enable({ firewallID })),
      updateFirewall: payload => dispatch(_update(payload))
    })
  );

export default connected;
