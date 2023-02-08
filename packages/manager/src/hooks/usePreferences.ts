import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { UserPreferences } from 'src/store/preferences/preferences.actions';
import { updateUserPreferences } from 'src/store/preferences/preferences.requests';
import { Dispatch } from './types';

export interface Preferences {
  preferences: UserPreferences;
  updateUserPreferences: (
    preferences: UserPreferences
  ) => Promise<UserPreferences>;
}

export const usePreferences = () => {
  const dispatch: Dispatch = useDispatch();
  const preferences = useSelector(
    (state: ApplicationState) => state.preferences.data
  );

  const updatePreferences = (newPreferences: UserPreferences) =>
    dispatch(updateUserPreferences({ ...preferences, ...newPreferences }));

  return {
    preferences,
    updatePreferences,
  };
};

export default usePreferences;
