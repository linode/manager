import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '..';

type Profile = Linode.Profile;

/**
 * getProfile
 *
 * Return the current (logged in) user's profile.
 * 
 * @returns { Promise }
 * 
 * @example getProfile() => 
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
 * @param data { Object }
 * 
 * @returns { Promise }
 * 
 * @example updateProfile({"email_notifications": "true"});
 */
export const updateProfile = (data: any) => Request<Linode.Profile>(
  setURL(`${API_ROOT}/profile`),
  setMethod('PUT'),
  /** @todo */
  // validateRequestData(data, ProfileUpdateSchema)
  setData(data),
)
  .then(response => response.data);


