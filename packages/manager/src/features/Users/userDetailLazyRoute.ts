import { createLazyRoute } from '@tanstack/react-router';

import { UserDetail } from './UserDetail';

export const userDetailLazyRoute = createLazyRoute('/account/users/$username')({
  component: UserDetail,
});
