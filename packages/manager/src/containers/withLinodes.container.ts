import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { path } from 'ramda';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { shallowExtendLinodes } from 'src/store/linodes/linodes.helpers';
import { State } from 'src/store/linodes/linodes.reducer';
import { ShallowExtendedLinode } from 'src/store/linodes/types';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export interface DispatchProps {
  getLinodes: (params?: any, filters?: any) => Promise<GetAllData<Linode>>;
}

/* tslint:disable-next-line */
export interface StateProps {
  linodesError?: APIError[];
  linodesLoading: State['loading'];
  linodesData: ShallowExtendedLinode[];
  linodesLastUpdated: State['lastUpdated'];
  linodesResults: State['results'];
}

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  linodes: Linode[],
  loading: boolean,
  error?: APIError[]
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
        itemsById,
        lastUpdated,
        results
      } = state.__resources.linodes;

      const linodes = Object.values(itemsById);
      const notifications = state.__resources.notifications.data ?? [];
      const { events } = state.events;

      const shallowExtendedLinodes = shallowExtendLinodes(
        linodes,
        notifications,
        events
      );

      if (mapStateToProps) {
        return mapStateToProps(
          ownProps,
          shallowExtendedLinodes,
          loading,
          path(['read'], error)
        );
      }

      return {
        linodesError: path(['read'], error),
        linodesLoading: loading,
        linodesData: shallowExtendedLinodes,
        linodesResults: results,
        linodesLastUpdated: lastUpdated
      };
    },
    (dispatch: ThunkDispatch) => ({
      getLinodes: (params, filter) =>
        dispatch(requestLinodes({ params, filter }))
    })
  );

export default connected;
