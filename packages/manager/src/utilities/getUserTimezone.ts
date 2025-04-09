import { DateTime, IANAZone } from 'luxon';

export const getUserTimezone = (profileTimezone?: string) => {
  return profileTimezone &&
    profileTimezone != '' &&
    IANAZone.isValidZone(profileTimezone)
    ? profileTimezone
    : DateTime.local().zoneName;
};
