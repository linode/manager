import { Grants } from 'linode-js-sdk/lib/account';
import { Profile } from 'linode-js-sdk/lib/profile';
import { ResourcePage } from 'linode-js-sdk/lib/types';
import { API_ROOT } from 'src/constants';

import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../index';
import { updateProfileSchema } from './profile.schema';

/**
 * getProfile
 *
 * Return the current (logged in) user's profile.
 *
 */
export const getProfile = () =>
  Request<Profile>(setURL(`${API_ROOT}/profile`), setMethod('GET'));

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
    setData(data, updateProfileSchema)
  ).then(response => response.data);

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
  Request<Grants>(setURL(`${API_ROOT}/profile/grants`)).then(
    response => response.data
  );

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
  Request<Grants>(setURL(`${API_ROOT}/profile/grants`), setMethod('GET')).then(
    response => response.data
  );

/**
 * getTrustedDevices
 *
 * Returns a paginated list of all trusted devices associated with the user's profile.
 */
export const getTrustedDevices = (params: any, filter: any) =>
  Request<ResourcePage<Linode.Device>>(
    setURL(`${API_ROOT}/profile/devices`),
    setMethod('GET'),
    setXFilter(filter),
    setParams(params)
  ).then(response => response.data);

/**
 * deleteTrustedDevice
 *
 * Deletes a trusted device from a user's profile
 */
export const deleteTrustedDevice = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/profile/devices/${id}`),
    setMethod('DELETE')
  ).then(response => response.data);

/**
 * getUserPreferences
 *
 * Retrieves an arbitrary JSON blob for the purposes of implementing
 * conditional logic based on preferences the user chooses
 */
export const getUserPreferences = () => {
  return Request<Record<string, any>>(
    setURL(`${API_ROOT}/profile/preferences`)
  ).then(response => response.data);
};

/**
 * getUserPreferences
 *
 * Stores an arbitrary JSON blob for the purposes of implementing
 * conditional logic based on preferences the user chooses
 */
export const updateUserPreferences = (payload: Record<string, any>) => {
  return Request<Record<string, any>>(
    setURL(`${API_ROOT}/profile/preferences`),
    setData(payload),
    setMethod('PUT')
  ).then(response => response.data);
};
