import { VLAN } from '@linode/api-v4/lib/vlans';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  getAllVlans as _getVLANs,
} from 'src/store/vlans/vlans.requests';
import { EntityError, ThunkDispatch } from 'src/store/types';

export interface StateProps {
  vlansData?: VLAN[];
  vlansLoading: boolean;
  vlansError: EntityError;
  vlansLastUpdated: number;
  vlansResults: number;
}

export interface VlanActionsProps {
  getAllVlans: () => Promise<VLAN[]>;
}

export type Props = StateProps & VlanActionsProps;

export default <InnerStateProps extends {}, TOuter extends {}>(
  mapVlansToProps?: (
    ownProps: TOuter,
    vlansData: VLAN[],
    vlansLoading: boolean,
    vlansError: EntityError,
    vlansResults: number,
    vlansLastUpdated: number
  ) => InnerStateProps
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const { vlans } = state.__resources;
      if (mapVlansToProps) {
        return mapVlansToProps(
          ownProps,
          Object.values(vlans.itemsById),
          vlans.loading,
          vlans.error,
          vlans.results,
          vlans.lastUpdated
        );
      }

      return {
        vlansLoading: vlans.loading,
        vlansError: vlans.error,
        vlansData: Object.values(vlans.itemsById),
        vlansResults: vlans.results,
        vlansLastUpdated: vlans.lastUpdated,
      };
    },
    (dispatch: ThunkDispatch) => ({
      getAllVlans: () => dispatch(_getVLANs({})),
    })
  );
