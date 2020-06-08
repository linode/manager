import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { setFeatureFlagsLoaded as _setFeatureFlagsLoaded } from 'src/store/featureFlagsLoad/featureFlagsLoad.actions';
import { Dispatch } from './types';

export const useFeatureFlagsLoad = () => {
  const dispatch: Dispatch = useDispatch();
  const featureFlagsLoading = useSelector(
    (state: ApplicationState) => state.featureFlagsLoad.featureFlagsLoading
  );
  const setFeatureFlagsLoaded = () => dispatch(_setFeatureFlagsLoaded());

  return { featureFlagsLoading, setFeatureFlagsLoaded };
};

export default useFeatureFlagsLoad;
