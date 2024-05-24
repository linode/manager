import * as React from 'react';

import type { PartialEventMap } from '../types';

export const ip: PartialEventMap = {
  ipaddress_update: {
    notification: () => (
      <>
        An IP address has been <strong>updated</strong> on your account.
      </>
    ),
  },
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
