import { LongviewClient } from 'linode-js-sdk/lib/longview';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/longview/longview.reducer';
import { getAllLongviewClients } from 'src/store/longview/longview.requests';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  getLongviewClients: (
    params?: any,
    filters?: any
  ) => Promise<GetAllData<LongviewClient[]>>;
}

/* tslint:disable-next-line */
export interface StateProps {
  longviewClientsError: State['error'];
  longviewClientsLoading: State['loading'];
  longviewClientsData: State['data'];
  longviewClientsLastUpdated: State['lastUpdated'];
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
        loading,
        error,
        data,
        lastUpdated,
        results
      } = state.longviewClients;
      if (mapStateToProps) {
        return mapStateToProps(ownProps, {
          longviewClientsData: data,
          longviewClientsError: error,
          longviewClientsLastUpdated: lastUpdated,
          longviewClientsLoading: loading,
          longviewClientsResults: results
        });
      }

      return {
        longviewClientsError: error,
        longviewClientsLoading: loading,
        longviewClientsData: data,
        longviewClientsResults: results,
        longviewClientsLastUpdated: lastUpdated
      };
    },
    (dispatch: ThunkDispatch) => ({
      getLongviewClients: (params, filter) =>
        dispatch(getAllLongviewClients({ params, filter }))
    })
  );

export default connected;
