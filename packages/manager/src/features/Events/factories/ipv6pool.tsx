import * as React from 'react';

import type { PartialEventMap } from '../types';

export const ipv6pool: PartialEventMap<'ipv6pool'> = {
  ipv6pool_add: {
    notification: () => (
      <>
        An IPv6 range has been <strong>added</strong> to your account.
      </>
    ),
  },
  ipv6pool_delete: {
    notification: () => (
      <>
        An IPv6 range has been <strong>deleted</strong> from your account.
      </>
    ),
  },
};
