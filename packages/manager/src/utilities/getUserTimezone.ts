import { DateTime, IANAZone } from 'luxon';
import { ApplicationState } from 'src/store';
import { path } from 'ramda';
import { APIError } from '@linode/api-v4/lib/types';

export const getUserTimezone = (state: ApplicationState) => {
  const stateTz = state.__resources?.profile?.data?.timezone;
  return stateTz && stateTz != '' && IANAZone.isValidZone(stateTz)
    ? stateTz
    : DateTime.local().zoneName;
};

export const getUserTimezoneLoading = (state: ApplicationState) => {
  return state.__resources.profile.loading;
};

export const getUserTimezoneData = (state: ApplicationState) => {
  return state.__resources.types.entities;
};

export const getUserTimezoneError = (state: ApplicationState) => {
  return path<APIError[]>(['read'], state.__resources.profile.error);
};

export const getUserTimezoneRequestError = (state: ApplicationState) => {
  return path<APIError[]>(['error', 'read'], state.__resources.linodes);
};
