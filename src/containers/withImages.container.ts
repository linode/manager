import { connect } from 'react-redux';

export default <TInner extends {}, TOutter extends {}>(
  mapImagesToProps: (ownProps: TOutter, images?: Linode.Image[]) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const images = state.__resources.images.entities;

  return mapImagesToProps(ownProps, images);
});
