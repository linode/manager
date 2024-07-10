import { useEffect } from 'react';

import { loginRoot } from './OAuth';

export const Logout = () => {
  useEffect(() => {
    localStorage.removeItem('authentication/token');
    localStorage.removeItem('authentication/expire');
    localStorage.removeItem('authentication/scopes');
    window.location.href = `${loginRoot}/logout`;
  }, []);
  return null;
};
