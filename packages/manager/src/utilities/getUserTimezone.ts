import { DateTime, IANAZone } from 'luxon';

const getUserTimezone = (profileTimezone?: string) => {
  return profileTimezone &&
    profileTimezone != '' &&
    IANAZone.isValidZone(profileTimezone)
    ? profileTimezone
    : DateTime.local().zoneName;
};

export default getUserTimezone;
