import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/profile`);

export interface ProfileWithPreferences extends Linode.Profile {
  preferences: Record<string, any>;
}

export const getProfileActions = actionCreator.async<
  void,
  ProfileWithPreferences,
  Linode.ApiFieldError[]
>(`request`);

export const handleUpdateProfile = actionCreator.async<
  Partial<ProfileWithPreferences>,
  Partial<ProfileWithPreferences>,
  Linode.ApiFieldError[]
>(`update`);
