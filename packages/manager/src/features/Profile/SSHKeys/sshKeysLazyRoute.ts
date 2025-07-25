import { createLazyRoute } from '@tanstack/react-router';

import { SSHKeys } from './SSHKeys';

export const sshKeysLazyRoute = createLazyRoute('/profile/keys')({
  component: SSHKeys,
});
