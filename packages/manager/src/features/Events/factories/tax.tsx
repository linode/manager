import * as React from 'react';

import type { PartialEventMap } from '../types';

export const tax: PartialEventMap<'tax'> = {
  tax_id_valid: {
    notification: () => (
      <>
        Tax Identification Number has been <strong>verified</strong>.
      </>
    ),
  },
  tax_id_verifying: {
    notification: () => (
      <>
        Tax Identification Number format is <strong>verifying</strong>.
      </>
    ),
  },
};
