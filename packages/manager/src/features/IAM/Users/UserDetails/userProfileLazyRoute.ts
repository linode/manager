import { createLazyRoute } from '@tanstack/react-router';

import { UserProfile } from './UserProfile';

export const userProfileLazyRoute = createLazyRoute('/iam/users/$username')({
  component: UserProfile,
});
