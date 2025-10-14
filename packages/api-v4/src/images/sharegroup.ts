import {
  addSharegroupMemberSchema,
  generateSharegroupTokenSchema,
  updateSharegroupMemberSchema,
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
  AddSharegroupMemberPayload,
  GenerateSharegroupTokenPayload,
  Image,
  Sharegroup,
  SharegroupMember,
  SharegroupToken,
  UpdateSharegroupMemberPayload,
} from './types';

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
      `${BETA_API_ROOT}/images/sharegroups/${encodeURIComponent(sharegroupId)}/images`,
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
    setURL(`${BETA_API_ROOT}/images/sharegroup/tokens`),
    setMethod('POST'),
    setData(data, generateSharegroupTokenSchema),
  );
};

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
      `${BETA_API_ROOT}/images/sharegroups/tokens/${encodeURIComponent(token_uuid)}/sharegroup/images`,
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
      `${BETA_API_ROOT}/images/sharegroup/${encodeURIComponent(sharegroupId)}/members`,
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
      `${BETA_API_ROOT}/images/sharegroup/${encodeURIComponent(sharegroupId)}/members/${encodeURIComponent(token_uuid)}`,
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
