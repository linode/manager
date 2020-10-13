import store from 'src/store';
import getUserTimezone from './getUserTimezone';

export const useTimezone = (): string => {
  const state = store.getState();
  return getUserTimezone(state);
};

export default useTimezone;
