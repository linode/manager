import { DateTime, IANAZone } from 'luxon';
import { ApplicationState } from 'src/store';

const getUserTimezone = (state: ApplicationState) => {
  const stateTz = state.__resources?.profile?.data?.timezone;
  return stateTz && stateTz != '' && IANAZone.isValidZone(stateTz)
    ? stateTz
    : DateTime.local().zoneName;
};

export default getUserTimezone;
