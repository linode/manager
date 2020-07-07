import { Image } from '@linode/api-v4/lib/images';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export default <TInner extends {}, TOuter extends {}>(
  propsSelector: (ownProps: TOuter) => null | string,
  mapImageToProps: (ownProps: TOuter, image?: Image) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const imageId = propsSelector(ownProps);

    if (!imageId) {
      return { image: null };
    }

    const image = state.__resources.images.itemsById[imageId];

    return mapImageToProps(ownProps, image);
  });
