import { getImages, Image } from 'linode-js-sdk/lib/images';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import { ThunkActionCreator } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { getImagesFailure, getImagesSuccess } from './image.actions';

export const requestImages: ThunkActionCreator<
  Promise<Image[]>
> = () => dispatch => {
  const getAllImages = getAll<Image>(getImages);

  return getAllImages()
    .then(({ data, results }) => {
      dispatch(
        getImagesSuccess({
          data,
          results
        } as ResourcePage<Image>)
      );
      return data;
    })
    .catch(err => {
      const ApiError = getAPIErrorOrDefault(
        err,
        'There was an error retrieving your Images.'
      );
      dispatch(getImagesFailure(ApiError));
      return err;
    });
};
