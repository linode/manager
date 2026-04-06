import * as React from 'react';

import type { PartialEventMap } from '../types';

export const account: PartialEventMap<'account'> = {
  account_agreement_eu_model: {
    notification: () => (
      <>
        The EU Model Contract has been <strong>signed</strong>.
      </>
    ),
  },
  account_promo_apply: {
    notification: () => (
      <>
        A promo code was <strong>applied</strong> to your account.
      </>
    ),
  },
  account_settings_update: {
    notification: () => (
      <>
        Your account settings have been <strong>updated</strong>.
      </>
    ),
  },
  account_update: {
    notification: () => (
      <>
        Your account has been <strong>updated</strong>.
      </>
    ),
  },
};
