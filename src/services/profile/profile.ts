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


