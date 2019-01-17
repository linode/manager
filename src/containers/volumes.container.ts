import { connect } from 'react-redux';

interface VolumesData {
  items: string[];
  itemsById: Record<string, Linode.Volume>
}

export interface Props {
  volumesData: VolumesData;
  volumesLoading: boolean;
  volumesError?: Error;
}

export default <TInner extends {}, TOutter extends {}>(
  mapVolumesToProps: (ownProps: TOutter, volumesData: VolumesData, volumesLoading: boolean, volumesError?: Error ) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const { items, itemsById } = state.__resources.volumes;

  const volumesData = { items, itemsById };
  const volumesLoading = state.__resources.volumes.loading;
  const volumesError = state.__resources.volumes.error;

  return mapVolumesToProps(ownProps, volumesData, volumesLoading, volumesError);
});