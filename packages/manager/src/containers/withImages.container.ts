import { Image } from 'linode-js-sdk/lib/images';
import { path } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface WithImages {
  images: Record<string, Image>;
  imagesLoading: boolean;
  imageError?: string;
}

export default <TInner extends {}, TOuter extends {}>(
  mapImagesToProps: (
    ownProps: TOuter,
    images: Record<string, Image>,
    imagesLoading: boolean,
    imageError?: string
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const { data: images, error, loading } = state.__resources.images;
    const imageError = path<undefined | string>(['read', 0, 'reason'], error);

    return mapImagesToProps(ownProps, images, loading, imageError);
  });
