import { DateTime, IANAZone } from 'luxon';
import { Profile } from '@linode/api-v4/lib';
import { queryKey } from 'src/queries/profile';
import { queryClient } from 'src/queries/base';

const getUserTimezone = (profile?: Profile) => {
  if (!profile) {
    profile = queryClient.getQueryData<Profile>(queryKey);
  }
  const stateTz = profile?.timezone;
  return stateTz && stateTz != '' && IANAZone.isValidZone(stateTz)
    ? stateTz
    : DateTime.local().zoneName;
};

export default getUserTimezone;
