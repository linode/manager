import { Volume } from 'linode-js-sdk/lib/volumes';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { EntityError } from 'src/store/types';
import { getVolumesPage as _getPage } from 'src/store/volume/volume.requests';

export interface StateProps {
  volumesData: Volume[];
  volumesLoading: boolean;
  volumesLastUpdated: number;
  volumesError: EntityError;
  volumesResults: number;
}

export type Props = StateProps & DispatchProps;

export interface DispatchProps {
  getVolumesPage: (params?: any, filters?: any) => Promise<Volume[]>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  getVolumesPage: (params: any = {}, filters: any = {}) =>
    dispatch(_getPage({ params, filters })).then(response => response.data)
});

export default <TInner extends {}, TOuter extends {}>(
  mapVolumesToProps?: (
    ownProps: TOuter,
    volumesData: Volume[],
    volumesLoading: boolean,
    volumesLastUpdated: number,
    volumesResults: number,
    volumesError?: EntityError
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const { itemsById, results } = state.__resources.volumes;

    const volumesData = Object.values(itemsById);
    const volumesLoading = state.__resources.volumes.loading;
    const volumesError = state.__resources.volumes.error;
    const volumesLastUpdated = state.__resources.volumes.lastUpdated;
    if (!mapVolumesToProps) {
      return {
        volumesData,
        volumesLoading,
        volumesLastUpdated,
        volumesResults: results,
        volumesError
      };
    }
    return mapVolumesToProps(
      ownProps,
      volumesData,
      volumesLoading,
      volumesLastUpdated,
      results,
      volumesError
    );
  }, mapDispatchToProps);
