import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/profile`);

export const getProfileActions = actionCreator.async<
  void,
  Linode.Profile,
  Linode.ApiFieldError[]
>(`request`);

export const handleUpdateProfile = actionCreator.async<
  Partial<Linode.Profile>,
  Partial<Linode.Profile>,
  Linode.ApiFieldError[]
>(`update`);
