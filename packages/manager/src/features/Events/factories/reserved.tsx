import * as React from 'react';

import type { PartialEventMap } from '../types';

export const reserved: PartialEventMap<'reserved'> = {
  reserved_ip_assign: {
    notification: () => (
      <>
        An reserved IP address has been <strong>assigned</strong> to your
        account.
      </>
    ),
  },
  reserved_ip_create: {
    notification: () => (
      <>
        A reserved IP address has been <strong>created</strong> on your
        account.
      </>
    ),
  },
  reserved_ip_delete: {
    notification: () => (
      <>
        An reserved IP address has been <strong>deleted</strong> from your
        account.
      </>
    ),
  },
  reserved_ip_unassign: {
    notification: () => (
      <>
        An reserved IP address has been <strong>unassigned</strong> from your
        account.
      </>
    ),
  },
};
