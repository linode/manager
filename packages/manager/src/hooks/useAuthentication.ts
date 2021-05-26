import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';

export const useAuthentication = () => {
  return useSelector((state: ApplicationState) => state.authentication);
};
