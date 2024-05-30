import * as React from 'react';

import type { PartialEventMap } from '../types';

export const entity: PartialEventMap<'entity'> = {
  entity_transfer_accept: {
    notification: () => (
      <>
        A service transfer has been <strong>accepted</strong>.
      </>
    ),
  },
  entity_transfer_accept_recipient: {
    notification: () => (
      <>
        You have <strong>accepted</strong> a service transfer.
      </>
    ),
  },
  entity_transfer_cancel: {
    notification: () => (
      <>
        A service transfer has been <strong>canceled</strong>.
      </>
    ),
  },
  entity_transfer_create: {
    notification: () => (
      <>
        A service transfer has been <strong>created</strong>.
      </>
    ),
  },
  entity_transfer_fail: {
    notification: () => (
      <>
        A service transfer could <strong>not</strong> be{' '}
        <strong>created</strong>.
      </>
    ),
  },
  entity_transfer_stale: {
    notification: () => (
      <>
        A service transfer token has <strong>expired</strong>.
      </>
    ),
  },
};
