import { Image } from 'linode-js-sdk/lib/images';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { EntityError } from 'src/store/types';

export interface WithImages {
  imagesData: Record<string, Image>;
  imagesLoading: boolean;
  imagesError: EntityError;
}

export default <TInner extends {}, TOuter extends {}>(
  mapImagesToProps?: (
    ownProps: TOuter,
    images: Record<string, Image>,
    imagesLoading: boolean,
    imagesError: EntityError
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const {
      data: imagesData,
      error: imagesError,
      loading
    } = state.__resources.images;

    if (!mapImagesToProps) {
      return {
        ...ownProps,
        imagesData,
        loading,
        imagesError
      };
    }

    return mapImagesToProps(ownProps, imagesData, loading, imagesError);
  });
