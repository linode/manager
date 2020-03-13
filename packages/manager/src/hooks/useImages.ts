import { Image } from 'linode-js-sdk/lib/images/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/image/image.reducer';
import { requestImages as _request } from 'src/store/image/image.requests';
import { Dispatch } from './types';

export interface ImagesProps {
  images: State;
  requestImages: () => Promise<Image[]>;
}

export const useImages = () => {
  const dispatch: Dispatch = useDispatch();
  const images = useSelector(
    (state: ApplicationState) => state.__resources.images
  );
  const requestImages = () => dispatch(_request());

  return { images, requestImages };
};

export default useImages;
