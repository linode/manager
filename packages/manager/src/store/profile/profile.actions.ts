import { Grants } from '@linode/api-v4/lib/account';
import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

export interface ExtendedProfile extends Profile {
  grants?: Grants;
  // A user's external UUID can be found on the response to /account.
  // Since that endpoint is not available to restricted users, the API also
  // returns it as an HTTP header ("X-Customer-Uuid"). This header is injected
  // in the response to `/profile` so that it's available in Redux.
  _euuidFromHttpHeader?: string;
}

const actionCreator = actionCreatorFactory(`@@manager/profile`);

export const getProfileActions = actionCreator.async<
  void,
  ExtendedProfile,
  APIError[]
>(`request`);

export const handleUpdateProfile = actionCreator.async<
  Partial<Profile>,
  Partial<Profile>,
  APIError[]
>(`update`);
