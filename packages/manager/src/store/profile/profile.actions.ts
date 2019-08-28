import { Profile } from 'linode-js-sdk/lib/profile'
import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/profile`);

export const getProfileActions = actionCreator.async<
  void,
  Profile,
  Linode.ApiFieldError[]
>(`request`);

export const handleUpdateProfile = actionCreator.async<
  Partial<Profile>,
  Partial<Profile>,
  Linode.ApiFieldError[]
>(`update`);
