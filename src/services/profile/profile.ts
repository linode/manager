import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';
import { updateProfileSchema } from './profile.schema';

type Profile = Linode.Profile;

/**
 * getProfile
 *
 * Return the current (logged in) user's profile.
 *
 */
export const getProfile = () => Request<Profile>(
  setURL(`${API_ROOT}/profile`),
  setMethod('GET'),
);

/**
 * updateProfile
 *
 * Update the current user's profile. Fields included in the
 * data param will be updated by the API; omitted fields will remain
 * unchanged.
 *
 */
export const updateProfile = (data: any) => Request<Profile>(
  setURL(`${API_ROOT}/profile`),
  setMethod('PUT'),
  setData(data, updateProfileSchema),
)
  .then(response => response.data);

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
export const listGrants = () => Request<Linode.Grants>(
  setURL(`${API_ROOT}/profile/grants`)
).then(response => response.data)

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
export const getMyGrants = () => Request<Linode.Grants>(
  setURL(`${API_ROOT}/profile/grants`),
  setMethod('GET'),
).then(response => response.data);
