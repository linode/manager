import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

const isEmpty = (error?: Linode.ApiFieldError[]) => {
  return error && error.length > 0;
};

export interface WithImages {
  images: Linode.Image[];
  imagesLoading: boolean;
  imageError?: string;
}

export default <TInner extends {}, TOuter extends {}>(
  mapImagesToProps: (
    ownProps: TOuter,
    images: Linode.Image[],
    imagesLoading: boolean,
    imageError?: string
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const images = state.__resources.images.entities;
    const imagesLoading = state.__resources.images.loading;
    const { error } = state.__resources.images;
    const imageError = isEmpty(error) ? error![0].reason : undefined; // @todo use updated error handling utils after they're merged

    return mapImagesToProps(ownProps, images, imagesLoading, imageError);
  });
