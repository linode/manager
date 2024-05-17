import {
  createImageSchema,
  updateImageSchema,
  uploadImageSchema,
} from '@linode/validation/lib/images.schema';
import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import { Filter, Params, ResourcePage as Page } from '../types';
import {
  CreateImagePayload,
  Image,
  ImageUploadPayload,
  UploadImageResponse,
} from './types';

/**
 * Get information about a single Image.
 *
 * @param imageId { string } ID of the Image to look up.
 */
export const getImage = (imageId: string) =>
  Request<Image>(
    setURL(`${API_ROOT}/images/${encodeURIComponent(imageId)}`),
    setMethod('GET')
  );

/**
 * Returns a paginated list of Images.
 *
 */
export const getImages = (params: Params = {}, filters: Filter = {}) =>
  Request<Page<Image>>(
    setURL(`${API_ROOT}/images`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

/**
 * Create a private gold-master Image from a Linode Disk.
 */
export const createImage = (data: CreateImagePayload) => {
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
    ...(description && { description }),
  };

  return Request<Image>(
    setURL(`${API_ROOT}/images/${encodeURIComponent(imageId)}`),
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
    setURL(`${API_ROOT}/images/${encodeURIComponent(imageId)}`),
    setMethod('DELETE')
  );
};

/**
 * uploadImage
 *
 * Create a pending Image
 *
 * The returned object includes an upload_to field to which
 * you can upload a pre-made Image that will be processed and
 * prepared for use.
 */
export const uploadImage = (data: ImageUploadPayload) => {
  return Request<UploadImageResponse>(
    setURL(`${API_ROOT}/images/upload`),
    setMethod('POST'),
    setData(data, uploadImageSchema)
  );
};
