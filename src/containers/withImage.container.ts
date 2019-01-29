import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export default <TInner extends {}, TOutter extends {}>(
  propsSelector: (ownProps: TOutter) => null | string,
  mapImageToProps: (ownProps: TOutter, image?: Linode.Image) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOutter) => {
    const imageId = propsSelector(ownProps);

    if (!imageId) {
      return { image: null };
    }

    const image = state.__resources.images.entities.find(i => i.id === imageId);

    return mapImageToProps(ownProps, image);
  });
