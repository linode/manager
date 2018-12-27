import { connect } from 'react-redux';

const isEmpty = (error?: Linode.ApiFieldError[]) => {
  return error && error.length > 0;
}

export default <TInner extends {}, TOutter extends {}>(
  mapImagesToProps: (ownProps: TOutter, images: Linode.Image[], imagesLoading: boolean, imageError?: string ) => TInner,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const images = state.__resources.images.entities;
  const imagesLoading = state.__resources.images.loading;
  const { error } = state.__resources.images;
  const imageError = isEmpty(error) ? error![0].reason : undefined; // @todo use updated error handling utils after they're merged

  return mapImagesToProps(ownProps, images, imagesLoading, imageError);
});
