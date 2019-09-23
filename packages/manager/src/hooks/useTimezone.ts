import { pathOr } from 'ramda';
import store from 'src/store';

export const useTimezone = (): string => {
  const state = store.getState();
  const timezone = pathOr(
    'GMT',
    ['__resources', 'profile', 'data', 'timezone'],
    state
  );

  return timezone;
};

export default useTimezone;
