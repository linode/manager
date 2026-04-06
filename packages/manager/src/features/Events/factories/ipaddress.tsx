import * as React from 'react';

import type { PartialEventMap } from '../types';

export const ip: PartialEventMap<'ipaddress'> = {
  ipaddress_update: {
    notification: () => (
      <>
        An IP address has been <strong>updated</strong> on your account.
      </>
    ),
  },
};
