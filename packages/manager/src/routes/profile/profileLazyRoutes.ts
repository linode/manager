import { createLazyRoute } from '@tanstack/react-router';

import { Profile } from 'src/features/Profile/Profile';

export const ProfileLazyRoute = createLazyRoute('/profile')({
  component: Profile,
});
