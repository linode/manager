import { Image } from '@linode/api-v4/lib/images/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/image/image.reducer';
import { requestImages as _request } from 'src/store/image/image.requests';
import { Dispatch } from './types';

export interface ImagesProps {
  images: State;
  requestImages: () => Promise<Image[]>;
}

export type Filter = 'public' | 'private' | 'all';

export const useImages = (filter: Filter = 'all') => {
  const dispatch: Dispatch = useDispatch();
  const images = useSelector(
    (state: ApplicationState) => state.__resources.images
  );
  const requestImages = () => dispatch(_request());

  return { images, requestImages };
};

export const filterImages = (
  filter: Filter,
  images: Record<string, Image>
): Record<string, Image> => {
  if (filter === 'all') {
    return images;
  }

  const isPublic = filter === 'public';

  return Object.values(images).reduce((accum, thisImage) => {
    return thisImage.is_public === isPublic
      ? { ...accum, [thisImage.id]: thisImage }
      : accum;
  }, {});
};

export default useImages;
