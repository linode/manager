import { DateTime, IANAZone } from 'luxon';
import { Profile } from '@linode/api-v4/lib';
import { getProfileData } from 'src/queries/profile';

const getUserTimezone = (profile?: Profile) => {
  if (!profile) {
    profile = getProfileData();
  }
  const stateTz = profile?.timezone;
  return stateTz && stateTz != '' && IANAZone.isValidZone(stateTz)
    ? stateTz
    : DateTime.local().zoneName;
};

export default getUserTimezone;
