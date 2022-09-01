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

/**
 * This works the same as all of our other entity hooks,
 * but since filtering public or private images is such
 * a common task, it's included here as an optional argument.
 *
 * Usage:
 *
 * const { images } = useImages(); // This is totally fine!
 * const { images: publicImages } = useImages('public');
 *
 * publicImages.itemsById will contain only public images.
 * publicImages.results will be the number of public images.
 *
 * @param filter
 */
export const useImages = (filter: Filter = 'all') => {
  const dispatch: Dispatch = useDispatch();
  const _images = useSelector(
    (state: ApplicationState) => state.__resources.images
  );
  const requestImages = () => dispatch(_request());

  const filteredImages = filterImages(filter, _images.itemsById);

  const images = {
    ..._images,
    itemsById: filteredImages,
    results: Object.keys(filteredImages).length,
  };

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
