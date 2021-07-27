import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { getImages, Image } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import { queryPresets } from './base';

export const queryKey = 'images';

export const useImages = () =>
  useQuery<Image[], APIError[]>(queryKey, getAllImagesRequest, {
    ...queryPresets.longLived,
  });

export const getAllImagesRequest = () =>
  getAll<Image>((params) => getImages(params))().then((data) => data.data);
