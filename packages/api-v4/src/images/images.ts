import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import { ResourcePage as Page } from '../types';
import { createImageSchema, updateImageSchema } from './images.schema';
import { Image } from './types';

/**
 * Get information about a single Image.
 *
 * @param imageId { string } ID of the Image to look up.
 */
export const getImage = (imageId: string) =>
  Request<Image>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * Returns a paginated list of Images.
 *
 */
export const getImages = (params: any = {}, filters: any = {}) =>
  Request<Page<Image>>(
    setURL(`${API_ROOT}/images`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  ).then(response => response.data);

/**
 * Create a private gold-master Image from a Linode Disk.
 *
 * @param diskId { number } The ID of the Linode Disk that this Image will be created from.
 * @param label { string } A short description of the Image. Labels cannot contain special characters.
 * @param description { string } A detailed description of this Image.
 */
export const createImage = (
  diskId: number,
  label?: string,
  description?: string
) => {
  const data = {
    disk_id: diskId,
    ...(label && { label }),
    ...(description && { description })
  };

  return Request<Image>(
    setURL(`${API_ROOT}/images`),
    setMethod('POST'),
    setData(data, createImageSchema)
  );
};

/**
 * Updates a private Image that you have permission to read_write.
 *
 * @param imageId { string } ID of the Image to look up.
 * @param label { string } A short description of the Image. Labels cannot contain special characters.
 * @param description { string } A detailed description of this Image.
 */
export const updateImage = (
  imageId: string,
  label?: string,
  description?: string
) => {
  const data = {
    ...(label && { label }),
    ...(description && { description })
  };

  return Request<Image>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('PUT'),
    setData(data, updateImageSchema)
  );
};

/**
 * Delete a private Image you have permission to read_write.
 *
 * @param imageId { string } the ID of the image to delete
 */
export const deleteImage = (imageId: string) => {
  return Request<{}>(
    setURL(`${API_ROOT}/images/${imageId}`),
    setMethod('DELETE')
  );
};
