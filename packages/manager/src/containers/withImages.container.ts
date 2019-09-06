import { Image } from 'linode-js-sdk/lib/images';
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
    const images = state.__resources.images.data;
    const imagesLoading = state.__resources.images.loading;
    const { error } = state.__resources.images;
    const imageError = (error || {}).read ? error!.read![0].reason : undefined;

    return mapImagesToProps(ownProps, images, imagesLoading, imageError);
  });
