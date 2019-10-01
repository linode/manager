import { Linode } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { path } from 'ramda';
import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { LinodeWithMaintenance as L } from 'src/store/linodes/linodes.helpers';
import { State } from 'src/store/linodes/linodes.reducer';
import { ThunkDispatch } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

interface DispatchProps {
  getLinodes: (params: any, filters: any) => Promise<GetAllData<Linode[]>>;
}

export type LinodeWithMaintenance = L;

/* tslint:disable-next-line */
export type StateProps = Omit<State, 'error'> & {
  error?: APIError[];
};

type MapProps<ReduxStateProps, OwnProps> = (
  ownProps: OwnProps,
  linodes: Linode[],
  loading: boolean,
  error?: APIError[]
) => ReduxStateProps & Partial<StateProps>;

export type Props = DispatchProps & StateProps;

const connected = <ReduxStateProps extends {}, OwnProps extends {}>(
  mapStateToProps?: MapProps<ReduxStateProps, OwnProps>
): InferableComponentEnhancerWithProps<any, any> =>
  connect<
    ReduxStateProps | StateProps,
    DispatchProps,
    OwnProps,
    ApplicationState
  >(
    (state, ownProps) => {
      const { loading, error, entities } = state.__resources.linodes;
      if (mapStateToProps) {
        return mapStateToProps(
          ownProps,
          entities,
          loading,
          path(['read'], error)
        );
      }

      return {
        ...state.__resources.linodes,
        error: path(['read'], state.__resources.linodes.error)
      };
    },
    (dispatch: ThunkDispatch) => ({
      getLinodes: (params, filter) =>
        dispatch(requestLinodes({ params, filter }))
    })
  );

export default connected;
