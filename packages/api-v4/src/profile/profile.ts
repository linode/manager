import {
  SecurityQuestionsSchema,
  SendCodeToPhoneNumberSchema,
  VerifyPhoneNumberCodeSchema,
} from '@linode/validation/lib/profile.schema';
import { updateProfileSchema } from '@linode/validation/lib/profile.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setHeaders,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Grants } from '../account';
import type { Filter, Params, ResourcePage } from '../types';
import type { RequestOptions } from '../types';
import type {
  Profile,
  ProfileLogin,
  SecurityQuestionsData,
  SecurityQuestionsPayload,
  SendPhoneVerificationCodePayload,
  TrustedDevice,
  UserPreferences,
  VerifyVerificationCodePayload,
} from './types';

/**
 * getProfile
 *
 * Return the current (logged in) user's profile.
 *
 */
export const getProfile = ({ headers }: RequestOptions = {}) => {
  return Request<Profile>(
    setURL(`${API_ROOT}/profile`),
    setMethod('GET'),
    setHeaders(headers),
  );
};

/**
 * updateProfile
 *
 * Update the current user's profile. Fields included in the
 * data param will be updated by the API; omitted fields will remain
 * unchanged.
 *
 */
export const updateProfile = (data: any) =>
  Request<Profile>(
    setURL(`${API_ROOT}/profile`),
    setMethod('PUT'),
    setData(data, updateProfileSchema),
  );

/**
 * listGrants
 *
 * This returns a GrantsResponse describing what the acting User has been granted access to.
 * For unrestricted users, this will return a 204 and no body because unrestricted users have
 * access to everything without grants. This will not return information about entities you do
 * not have access to. This endpoint is useful when writing third-party OAuth applications to
 * see what options you should present to the acting User.
 *
 * This endpoint is unauthenticated.
 */
export const listGrants = () =>
  Request<Grants>(setURL(`${API_ROOT}/profile/grants`));

/**
 * getMyGrants
 *
 * This returns a GrantsResponse describing what the acting User has been granted access to. For
 * unrestricted users, this will return a 204 and no body because unrestricted users have access
 * to everything without grants. This will not return information about entities you do not have
 * access to. This endpoint is useful when writing third-party OAuth applications to see what
 * options you should present to the acting User.
 *
 */
export const getMyGrants = () =>
  Request<Grants>(setURL(`${API_ROOT}/profile/grants`), setMethod('GET'));

/**
 * getTrustedDevices
 *
 * Returns a paginated list of all trusted devices associated with the user's profile.
 */
export const getTrustedDevices = (params?: Params, filter?: Filter) =>
  Request<ResourcePage<TrustedDevice>>(
    setURL(`${API_ROOT}/profile/devices`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );

/**
 * deleteTrustedDevice
 *
 * Deletes a trusted device from a user's profile
 */
export const deleteTrustedDevice = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/devices/${encodeURIComponent(id)}`),
    setMethod('DELETE'),
  );

/**
 * getUserPreferences
 *
 * Retrieves an arbitrary JSON blob for the purposes of implementing
 * conditional logic based on preferences the user chooses
 */
export const getUserPreferences = () => {
  return Request<Record<string, any>>(
    setURL(`${API_ROOT}/profile/preferences`),
  );
};

/**
 * getUserPreferences
 *
 * Stores an arbitrary JSON blob for the purposes of implementing
 * conditional logic based on preferences the user chooses
 */
export const updateUserPreferences = (payload: UserPreferences) => {
  return Request<UserPreferences>(
    setURL(`${API_ROOT}/profile/preferences`),
    setData(payload),
    setMethod('PUT'),
  );
};

export const getLogins = (params?: Params, filter?: Filter) => {
  return Request<ResourcePage<ProfileLogin>>(
    setURL(`${API_ROOT}/profile/logins`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params),
  );
};

/**
 * getSecurityQuestions
 *
 * Retrieves an array of security questions for the current user.
 */
export const getSecurityQuestions = () => {
  return Request<SecurityQuestionsData>(
    setURL(`${API_ROOT}/profile/security-questions`),
    setMethod('GET'),
  );
};

/**
 * updateSecurityQuestions
 *
 * Updates the current user's security questions.
 */
export const updateSecurityQuestions = (payload: SecurityQuestionsPayload) => {
  return Request<SecurityQuestionsPayload>(
    setURL(`${API_ROOT}/profile/security-questions`),
    setMethod('POST'),
    setData(payload, SecurityQuestionsSchema),
  );
};

/**
 * smsOptOut
 *
 * Opts user out of SMS messaging
 */
export const smsOptOut = () => {
  return Request<{}>(
    setURL(`${API_ROOT}/profile/phone-number`),
    setMethod('DELETE'),
  );
};

/**
 * sendCodeToPhoneNumber
 *
 * Sends a one-time password via SMS to be used to verify a phone number.
 */
export const sendCodeToPhoneNumber = (
  data: SendPhoneVerificationCodePayload,
) => {
  return Request<{}>(
    setURL(`${API_ROOT}/profile/phone-number`),
    setMethod('POST'),
    setData(data, SendCodeToPhoneNumberSchema),
  );
};

/**
 * verifyPhoneNumberCode
 *
 * Verifies a one-time password sent using `sendCodeToPhoneNumber`.
 */
export const verifyPhoneNumberCode = (data: VerifyVerificationCodePayload) => {
  return Request<{}>(
    setURL(`${API_ROOT}/profile/phone-number/verify`),
    setMethod('POST'),
    setData(data, VerifyPhoneNumberCodeSchema),
  );
};
