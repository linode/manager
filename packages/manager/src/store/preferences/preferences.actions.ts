import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/preferences`);

export const handleGetPreferences = actionCreator.async<
  void,
  Record<string, any>,
  APIError[]
>(`get`);

export const handleUpdatePreferences = actionCreator.async<
  Record<string, any>,
  Record<string, any>,
  APIError[]
>(`update`);
