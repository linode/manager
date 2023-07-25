import * as React from 'react';
import { useSelector } from 'react-redux';

import { ApplicationState } from 'src/store';

export const useAuthentication = () => {
  return useSelector((state: ApplicationState) => state.authentication);
};

// Returns the session token, using a ref to ensure the value is always fresh.
export const useCurrentToken = () => {
  const { token } = useAuthentication();
  const tokenRef = React.useRef(token);
  React.useEffect(() => {
    tokenRef.current = token;
  });
  return tokenRef.current;
};
