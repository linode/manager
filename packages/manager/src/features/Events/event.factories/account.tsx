import type { PartialEventMap } from '../events.factory';

export const account: PartialEventMap = {
  account_agreement_eu_model: {
    notification: () => 'The EU Model Contract has been signed.',
  },
  account_promo_apply: {
    notification: () => 'A promo code was applied to your account.',
  },
  account_settings_update: {
    notification: () => 'Your account settings have been updated.',
  },
  account_update: {
    notification: () => 'Your account settings have been updated.',
  },
};
