import { DateTime, IANAZone } from 'luxon';
import store from '../store';

const getUserTimezone = () => {
  const stateTz = store.getState().__resources?.profile?.data?.timezone;
  return stateTz && stateTz != '' && IANAZone.isValidZone(stateTz)
    ? stateTz
    : DateTime.local().zoneName;
};

export default getUserTimezone;
