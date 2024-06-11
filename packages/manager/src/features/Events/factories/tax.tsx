import * as React from 'react';

import type { PartialEventMap } from '../types';

export const tax: PartialEventMap<'tax'> = {
  tax_id_invalid: {
    notification: () => (
      <>
        Tax Identification Number format is <strong>invalid</strong>.
      </>
    ),
  },
};
