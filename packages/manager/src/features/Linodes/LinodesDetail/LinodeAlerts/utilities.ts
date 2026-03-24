import type { Linode } from '@linode/api-v4';

/**
 * Returns Formik-compatible initial values for the legacy alert threshold fields.
 * ACLP alert fields (system_alerts & user_alerts) are intentionally excluded -
 * they are managed separately within AlertReusableComponent.
 */
export const getLinodeAlertsInitialValues = (
  linode: Linode | undefined
): Pick<
  Linode['alerts'],
  'cpu' | 'io' | 'network_in' | 'network_out' | 'transfer_quota'
> => ({
  cpu: linode?.alerts.cpu ?? 0,
  io: linode?.alerts.io ?? 0,
  network_in: linode?.alerts.network_in ?? 0,
  network_out: linode?.alerts.network_out ?? 0,
  transfer_quota: linode?.alerts.transfer_quota ?? 0,
});
