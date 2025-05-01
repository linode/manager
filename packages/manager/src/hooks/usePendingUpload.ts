import { useSelector } from 'react-redux';

import type { ApplicationState } from 'src/store';

export const usePendingUpload = () => {
  return useSelector((state: ApplicationState) => state.pendingUpload);
};
