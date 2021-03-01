import { CreateImagePayload, Image } from '@linode/api-v4/lib/images';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { UpdateImagePayload } from 'src/store/image/image.actions';
import {
  createImage as _create,
  requestImages as _request,
  updateImage as _update,
} from 'src/store/image/image.requests';
import { EntityError } from 'src/store/types';

export interface WithImages {
  imagesData: Record<string, Image>;
  imagesLoading: boolean;
  imagesError: EntityError;
  imagesLastUpdated: number;
}

export interface ImagesDispatch {
  createImage: (payload: CreateImagePayload) => Promise<Image>;
  requestImages: () => Promise<Image[]>;
  updateImage: (payload: UpdateImagePayload) => Promise<Image>;
}

const mapDispatchToProps: MapDispatchToProps<ImagesDispatch, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  createImage: (payload: CreateImagePayload) => dispatch(_create(payload)),
  requestImages: () => dispatch(_request()),
  updateImage: (payload: UpdateImagePayload) => dispatch(_update(payload)),
});

export default <TInner extends {}, TOuter extends {}>(
  mapImagesToProps?: (
    ownProps: TOuter,
    images: Record<string, Image>,
    imagesLoading: boolean,
    imagesError: EntityError,
    lastUpdated: number
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const {
      itemsById: imagesData,
      error: imagesError,
      loading,
      lastUpdated,
    } = state.__resources.images;

    if (!mapImagesToProps) {
      return {
        ...ownProps,
        imagesData,
        imagesLoading: loading,
        imagesError,
        imagesLastUpdated: lastUpdated,
      };
    }

    return mapImagesToProps(
      ownProps,
      imagesData,
      loading,
      imagesError,
      lastUpdated
    );
  }, mapDispatchToProps);
