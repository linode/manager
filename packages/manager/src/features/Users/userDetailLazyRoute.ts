import { createLazyRoute } from '@tanstack/react-router';

import { UserDetail } from 'src/features/Users/UserDetail';

export const userDetailLazyRoute = createLazyRoute('/account/users/$username')({
  component: UserDetail,
});
