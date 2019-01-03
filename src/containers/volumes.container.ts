import { connect } from 'react-redux';
export interface Props {
  volumesData: Linode.Volume[];
  volumesLoading: boolean;
  volumesError?: Error;
}

export default <TInner extends {}, TOutter extends {}>(
  mapVolumesToProps: (ownProps: TOutter, volumesData: Linode.Volume[], volumesLoading: boolean, volumesError?: Linode.ApiFieldError[] ) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const volumesData = state.__resources.volumes.entities;
  const volumesLoading = state.__resources.images.loading;
  const volumesError = state.__resources.volumes.error;

  return mapVolumesToProps(ownProps, volumesData, volumesLoading, volumesError);
});

