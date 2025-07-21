import { createLazyRoute } from '@tanstack/react-router';

import AccountLogins from './AccountLogins';

export const accountLoginsLazyRoute = createLazyRoute('/account/login-history')(
  {
    component: AccountLogins,
  }
);
