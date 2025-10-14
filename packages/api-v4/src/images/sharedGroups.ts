import {
  addSharegroupImagesSchema,
  createSharegroupSchema,
  updateSharegroupImageSchema,
  updateSharegroupSchema,
} from '@linode/validation/lib/images.schema';

import { BETA_API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  AddSharegroupImagesPayload,
  CreateSharegroupPayload,
  Image,
  Sharegroup,
  UpdateSharegroupImagePayload,
  UpdateSharegroupPayload,
} from './types';

/**
 * Create a Image Sharegroup.
 *
 * @param data { createSharegroupPayload } the sharegroup details
 */
export const createSharegroup = (data: CreateSharegroupPayload) => {
  return Request<Sharegroup>(
    setURL(`${BETA_API_ROOT}/images/sharegroups`),
    setMethod('POST'),
    setData(data, createSharegroupSchema),
  );
};

/**
 * Add Images to the Sharegroup
 *
 * @param sharegroupId { string } ID of the sharegroup to add images
 * @param data { AddSharegroupImagesPayload } the image details
 */
export const addImagesToSharegroup = (
  sharegroupId: number,
  data: AddSharegroupImagesPayload,
) => {
  return Request<Sharegroup>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/images`,
    ),
    setMethod('POST'),
    setData(data, addSharegroupImagesSchema),
  );
};

/**
 * Returns a paginated list of Sharegroups
 */
export const getSharegroups = (params: Params = {}, filters: Filter = {}) =>
  Request<Page<Sharegroup>>(
    setURL(`${BETA_API_ROOT}/images/sharegroups`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * Get information about a single Sharegroup
 *
 * @param sharegroupId {string} ID of the Sharegroup to look up
 */
export const getSharegroup = (sharegroupId: string) =>
  Request<Sharegroup>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}`,
    ),
    setMethod('GET'),
  );

/**
 * Get a paginated list of Images present in a Sharegroup
 *
 * @param sharegroupId {string} ID of the Sharegroup to look up
 */
export const getSharegroupImages = (
  sharegroupId: string,
  params: Params = {},
  filters: Filter = {},
) =>
  Request<Page<Image>>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/images`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

/**
 * Update a Sharegroup.
 *
 * @param sharegroupId {string} ID of the Sharegroup to update
 * @param data { updateSharegroupPayload } the sharegroup details
 */
export const updateSharegroup = (
  sharegroupId: string,
  data: UpdateSharegroupPayload,
) => {
  return Request<Sharegroup>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}`,
    ),
    setMethod('PUT'),
    setData(data, updateSharegroupSchema),
  );
};

/**
 * Update a Image in a Sharegroup.
 *
 * @param sharegroupId {string} ID of the Sharegroup the image belongs to
 * @param imageId {string} ID of the Image to update
 * @param data { UpdateSharegroupImagePayload } the updated image details
 */
export const updateSharegroupImage = (
  sharegroupId: string,
  imageId: string,
  data: UpdateSharegroupImagePayload,
) => {
  return Request<Image>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroup/${encodeURIComponent(sharegroupId)}/images/${encodeURIComponent(imageId)}}`,
    ),
    setMethod('PUT'),
    setData(data, updateSharegroupImageSchema),
  );
};

/**
 * Delete a sharegroup
 *
 * @param sharegroupId {string} ID of the sharegroup to delete
 */
export const deleteSharegroup = (sharegroupId: string) => {
  return Request<{}>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}`,
    ),
    setMethod('DELETE'),
  );
};

/**
 * Delete a sharegroup Image
 *
 * @param sharegroupId {string} ID of the sharegroup to delete
 * @param imageId {string} ID of the image to delete
 */
export const deleteSharegroupImage = (
  sharegroupId: string,
  imageId: string,
) => {
  return Request<{}>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/images/${encodeURIComponent(imageId)}`,
    ),
    setMethod('DELETE'),
  );
};
