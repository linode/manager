import { Volume } from '@linode/api-v4/lib/volumes';
import { connect } from 'react-redux';
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
    const {
      error,
      itemsById,
      lastUpdated,
      loading,
      results,
    } = state.__resources.volumes;

    const volumesData = Object.values(itemsById);
    const volumesLoading = loading;
    const volumesError = error;
    const volumesLastUpdated = lastUpdated;
    if (!mapVolumesToProps) {
      return {
        volumesData,
        volumesLoading,
        volumesLastUpdated,
        volumesResults: results,
        volumesError,
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
  });
