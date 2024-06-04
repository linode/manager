import * as React from 'react';

import type { PartialEventMap } from '../types';

export const payment: PartialEventMap<'payment'> = {
  payment_method_add: {
    notification: () => (
      <>
        A payment method has been <strong>added</strong>.
      </>
    ),
  },
  payment_submitted: {
    notification: () => (
      <>
        A payment has been <strong>submitted</strong>.
      </>
    ),
  },
};
