import {
  addSharegroupImagesSchema,
  addSharegroupMemberSchema,
  createSharegroupSchema,
  generateSharegroupTokenSchema,
  updateSharegroupImageSchema,
  updateSharegroupMemberSchema,
  updateSharegroupSchema,
  updateSharegroupTokenSchema,
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
  AddSharegroupMemberPayload,
  CreateSharegroupPayload,
  GenerateSharegroupTokenPayload,
  Image,
  Sharegroup,
  SharegroupMember,
  SharegroupToken,
  UpdateSharegroupImagePayload,
  UpdateSharegroupMemberPayload,
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
 *  Add Member to the Sharegroup
 *
 * @param sharegroupId {string} ID of the Sharegroup to add member
 * @param data {AddSharegroupMemberPayload} the Member details
 */
export const addMembersToSharegroup = (
  sharegroupId: number,
  data: AddSharegroupMemberPayload,
) => {
  return Request<Sharegroup>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/members`,
    ),
    setMethod('POST'),
    setData(data, addSharegroupMemberSchema),
  );
};

/**
 * Generate user token for the Sharegroup
 *
 * @param data {GenerateSharegroupTokenPayload} the token details
 */
export const generateSharegroupToken = (
  data: GenerateSharegroupTokenPayload,
) => {
  return Request<SharegroupToken>(
    setURL(`${BETA_API_ROOT}/images/sharegroups/tokens`),
    setMethod('POST'),
    setData(data, generateSharegroupTokenSchema),
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
 * Lists all the sharegroups a given private image is present in.
 *
 * @param imageId { string } ID of the Image to look up.
 */
export const getSharegroupsFromImage = (
  imageId: string,
  params: Params = {},
  filters: Filter = {},
) =>
  Request<Page<Sharegroup>>(
    setURL(`${BETA_API_ROOT}/images/${imageId}/sharegroups`),
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
 * Get details of the Sharegroup the token has been accepted into
 *
 * @param token_uuid {string} Token UUID of the user
 */
export const getSharegroupFromToken = (token_uuid: string) => {
  Request<Sharegroup>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}/sharegroup`,
    ),
    setMethod('GET'),
  );
};

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
 * Get a paginated list of Sharegroup Images the token has been accepted into
 *
 * @param token_uuid {string} Token UUID of the user
 */
export const getSharegroupImagesFromToken = (
  token_uuid: string,
  params: Params = {},
  filters: Filter = {},
) => {
  Request<Page<Image>>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}/sharegroups/images`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
};

/**
 * Get a paginated list of members part of the Sharegroup
 *
 * @param sharegroupId {string} ID of the Sharegroup to look up
 */
export const getSharegroupMembers = (
  sharegroupId: string,
  params: Params = {},
  filters: Filter = {},
) => {
  Request<Page<SharegroupMember>>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/members`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
};

/**
 * Get member details of a user from the Sharegroup
 *
 * @param sharegroupId {string} ID of the Sharegroup to look up
 * @param token_uuid {string} Token UUID of the user to look up
 */
export const getSharegroupMember = (
  sharegroupId: string,
  token_uuid: string,
) => {
  Request<SharegroupMember>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/members/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('GET'),
  );
};

/**
 * Returns a paginated list of tokens created by the user
 */
export const getUserSharegroupTokens = (
  params: Params = {},
  filters: Filter = {},
) => {
  Request<Page<SharegroupToken>>(
    setURL(`${BETA_API_ROOT}/images/sharegroups/tokens`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
};

/**
 * Get details about a specific token created by the user
 *
 * @param token_uuid Token UUID of the user to look up
 */
export const getUserSharegroupToken = (token_uuid: string) => {
  Request<SharegroupToken>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('GET'),
  );
};

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
 * Update an Image in a Sharegroup.
 *
 * @param sharegroupId {string} ID of the Sharegroup the image belongs to
 * @param imageId {string} ID of the Image to update
 * @param data { UpdateSharegroupImagePayload } the updated image details
 */
interface UpdateSharegroupImage {
  data: UpdateSharegroupImagePayload;
  imageId: string;
  sharegroupId: string;
}
export const updateSharegroupImage = ({
  sharegroupId,
  imageId,
  data,
}: UpdateSharegroupImage) => {
  return Request<Image>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroup/${encodeURIComponent(sharegroupId)}/images/${encodeURIComponent(imageId)}}`,
    ),
    setMethod('PUT'),
    setData(data, updateSharegroupImageSchema),
  );
};

/**
 * Update a Sharegroup member's label
 *
 * @param token_uuid {string} token UUID of the user
 * @param data {UpdateSharegroupMemberPayload} the updated label
 */
interface UpdateSharegroupMember {
  data: UpdateSharegroupMemberPayload;
  sharegroupId: string;
  token_uuid: string;
}

export const updateSharegroupMember = ({
  sharegroupId,
  token_uuid,
  data,
}: UpdateSharegroupMember) => {
  return Request<SharegroupMember>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/members/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('PUT'),
    setData(data, updateSharegroupMemberSchema),
  );
};

/**
 * Update a user token's label
 *
 * @param token_uuid {string} token UUID of the user
 * @param data {UpdateSharegroupMemberPayload} the updated label
 */
export const updateSharegroupToken = (
  token_uuid: string,
  data: UpdateSharegroupMemberPayload,
) => {
  return Request<SharegroupToken>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('PUT'),
    setData(data, updateSharegroupTokenSchema),
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

/**
 * Delete a sharegroup Member
 *
 * @param token_uuid {string} Token UUID of the member to delete
 */
export const deleteSharegroupMember = (
  sharegroupId: string,
  token_uuid: string,
) => {
  return Request<{}>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/members/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('DELETE'),
  );
};

/**
 * Delete a user token
 *
 * @param token_uuid {string} Token UUID of the user to delete
 */
export const deleteSharegroupToken = (token_uuid: string) => {
  return Request<{}>(
    setURL(
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}`,
    ),
    setMethod('DELETE'),
  );
};
