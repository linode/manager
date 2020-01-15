import { GlobalGrantTypes } from 'linode-js-sdk/lib/account';
import store, { ApplicationState } from 'src/store';

export const isRestrictedUser = (_state?: ApplicationState) => {
  const state = _state ?? store.getState();
  return state?.__resources?.profile?.data?.restricted ?? false;
};

export const hasGrant = (state: ApplicationState, grant: GlobalGrantTypes) => {
  return state?.__resources?.profile?.data?.grants?.global?.[grant] ?? false;
};
