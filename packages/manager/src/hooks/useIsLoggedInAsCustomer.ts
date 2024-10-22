import { useSelector } from 'react-redux';

import type { ApplicationState } from 'src/store';

export const useIsLoggedInAsCustomer = () => {
  return useSelector(
    (state: ApplicationState) => state.authentication.loggedInAsCustomer
  );
};
