import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/preferences`);

export const handleGetPreferences = actionCreator.async<
  void,
  Record<string, any>,
  Linode.ApiFieldError[]
>(`get`);

export const handleUpdatePreferences = actionCreator.async<
  Record<string, any>,
  Record<string, any>,
  Linode.ApiFieldError[]
>(`update`);
