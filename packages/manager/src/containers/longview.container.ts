import { Filter, Params } from '@linode/api-v4';
import { LongviewClient } from '@linode/api-v4/lib/longview';
import { InferableComponentEnhancerWithProps, connect } from 'react-redux';

import { ApplicationState } from 'src/store';
import { State } from 'src/store/longview/longview.reducer';
import {
  deleteLongviewClient as _delete,
  createLongviewClient as create,
  getAllLongviewClients,
  updateLongviewClient as update,
} from 'src/store/longview/longview.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  createLongviewClient: (label?: string) => Promise<LongviewClient>;
  deleteLongviewClient: (id: number) => Promise<{}>;
  getLongviewClients: (
    params?: Params,
    filters?: Filter
  ) => Promise<GetAllData<LongviewClient>>;
  updateLongviewClient: (id: number, label: string) => Promise<LongviewClient>;
}

export interface StateProps {
  longviewClientsData: State['data'];
  longviewClientsError: State['error'];
  longviewClientsLastUpdated: State['lastUpdated'];
  longviewClientsLoading: State['loading'];
  longviewClientsResults: State['results'];
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  data: StateProps
) => ReduxStateProps & Partial<StateProps>;

export type Props = DispatchProps & StateProps;

interface Connected {
  <ReduxStateProps, OwnProps>(
    mapStateToProps: MapProps<ReduxStateProps, OwnProps>
  ): InferableComponentEnhancerWithProps<
    ReduxStateProps & Partial<StateProps> & DispatchProps & OwnProps,
    OwnProps
  >;
  <ReduxStateProps, OwnProps>(): InferableComponentEnhancerWithProps<
    ReduxStateProps & DispatchProps & OwnProps,
    OwnProps
  >;
}

const connected: Connected = <ReduxState extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxState, OwnProps>
) =>
  connect<
    (ReduxState & Partial<StateProps>) | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const {
        data,
        error,
        lastUpdated,
        loading,
        results,
      } = state.longviewClients;
      if (mapStateToProps) {
        return mapStateToProps(ownProps, {
          longviewClientsData: data,
          longviewClientsError: error,
          longviewClientsLastUpdated: lastUpdated,
          longviewClientsLoading: loading,
          longviewClientsResults: results,
        });
      }

      return {
        longviewClientsData: data,
        longviewClientsError: error,
        longviewClientsLastUpdated: lastUpdated,
        longviewClientsLoading: loading,
        longviewClientsResults: results,
      };
    },
    (dispatch: ThunkDispatch) => ({
      createLongviewClient: (label) => dispatch(create({ label })),
      deleteLongviewClient: (id) => dispatch(_delete({ id })),
      getLongviewClients: (params, filter) =>
        dispatch(getAllLongviewClients({ filter, params })),
      updateLongviewClient: (id, label) => dispatch(update({ id, label })),
    })
  );

export default connected;
