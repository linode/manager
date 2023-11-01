import { useSelector } from 'react-redux';

import { ApplicationState } from 'src/store';

export const useGlobalErrors = () => {
  return useSelector((state: ApplicationState) => state.globalErrors);
};
