import { useSelector } from 'react-redux';

import { ApplicationState } from 'src/store';

export const usePendingUpload = () => {
  return useSelector((state: ApplicationState) => state.pendingUpload);
};
