import { Grants } from '@linode/api-v4/lib/account/types';
import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

export interface ExtendedProfile extends Profile {
  grants?: Grants;
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
