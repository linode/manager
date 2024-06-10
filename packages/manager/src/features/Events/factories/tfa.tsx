import * as React from 'react';

import type { PartialEventMap } from '../types';

export const tfa: PartialEventMap<'tfa'> = {
  tfa_disabled: {
    notification: () => (
      <>
        Two-factor authentication has been <strong>disabled</strong>.
      </>
    ),
  },
  tfa_enabled: {
    notification: () => (
      <>
        Two-factor authentication has been <strong>enabled</strong>.
      </>
    ),
  },
};
