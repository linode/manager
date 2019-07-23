import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { EntityError } from 'src/store/types';

interface VolumesData {
  items: string[];
  itemsById: Record<string, Linode.Volume>;
}

export interface Props {
  volumesData: VolumesData;
  volumesLoading: boolean;
  volumesError?: EntityError;
}

export default <TInner extends {}, TOuter extends {}>(
  mapVolumesToProps: (
    ownProps: TOuter,
    volumesData: VolumesData,
    volumesLoading: boolean,
    volumesError?: EntityError
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const { items, itemsById } = state.__resources.volumes;

    const volumesData = { items, itemsById };
    const volumesLoading = state.__resources.volumes.loading;
    const volumesError = state.__resources.volumes.error;

    return mapVolumesToProps(
      ownProps,
      volumesData,
      volumesLoading,
      volumesError
    );
  });
