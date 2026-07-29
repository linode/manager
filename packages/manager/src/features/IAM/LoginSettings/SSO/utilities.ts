import { getCertificateStatus } from './IdpConfigurations/idpConfigurationDrawer.utils';

import type { IdpCertificate, IdpConfig } from '@linode/api-v4';

export interface CertificateCounts {
  /** Certs not yet expired ('active' or 'other') */
  activeCertificatesCount: number;
  /** Certs with status 'active' only (valid for > 90 days) */
  activeOnlyCount: number;
  /** Certs with status 'error' (already expired) */
  expiredCount: number;
  /** Certs with status 'other' (expiring within 90 days) */
  expiringCount: number;
}

// Count the number of certificates in each status category for a given array of certs.
export const getCertificateCounts = (
  certs: IdpCertificate[]
): CertificateCounts => {
  // Count certificates that are not expired (error). Both 'active' and
  // 'other' (expiring soon) are considered valid for deletion rules.
  const activeCertificatesCount = certs.filter(
    (cert) =>
      getCertificateStatus(cert.not_after, cert.not_before).status !==
        'error' &&
      getCertificateStatus(cert.not_after, cert.not_before).status !==
        'inactive'
  ).length;

  // Count only currently-active certificates (not 'other', 'inactive', or 'error').
  // We use this to decide whether to show the banner — if there are no
  // actively-valid certificates (i.e., only 'other' or 'error'), we
  // should surface a banner. This ensures a single 'yellow' cert shows
  // the yellow warning banner.
  const activeOnlyCount = certs.filter(
    (cert) =>
      getCertificateStatus(cert.not_after, cert.not_before).status === 'active'
  ).length;

  const expiredCount = certs.length - activeCertificatesCount;
  const expiringCount = activeCertificatesCount - activeOnlyCount;
  return {
    activeCertificatesCount,
    activeOnlyCount,
    expiredCount,
    expiringCount,
  };
};

// Determine if there is no valid certificates: either there are no certificates at all,
//  or all certificates are expired or not yet valid.
export const hasNoValidCertificates = (idpConfig: IdpConfig) => {
  const certs = idpConfig.saml.public_certificates;

  if (certs.length === 0) return true;

  const { activeCertificatesCount } = getCertificateCounts(certs);

  return activeCertificatesCount === 0;
};

export interface SummaryStatusConfig {
  enabled: boolean;
  enforce: boolean;
  excluded_users_count: number;
  included_users_count: number;
}

// Generate summary status message for IDP configuration based on enabled, enforce, included_users_count and excluded_users_count fields.
export const getSummaryStatus = (
  idpConfig: null | SummaryStatusConfig,
  isSummary?: boolean
): string => {
  if (!idpConfig) {
    return 'SSO is not configured for this account.';
  }

  // enabled = false
  if (!idpConfig.enabled) {
    return `SSO is disabled${isSummary ? ' and not enforced' : ''}. All users log in using alternative methods.`;
  }

  // enabled = true and enforce = false and included_users_count > 0
  if (!idpConfig.enforce && idpConfig.included_users_count > 0) {
    return `${isSummary ? 'SSO is enabled and required' : 'SSO is enforced'} for ${idpConfig.included_users_count} user${idpConfig.included_users_count > 1 ? 's' : ''}. All remaining users log in using alternative methods.`;
  }

  // enabled = true and enforce = false and included_users_count = 0
  if (!idpConfig.enforce) {
    return `SSO is enabled but not enforced${isSummary ? ' for any users.' : '.'} All users log in using alternative methods.`;
  }

  // enabled = true and enforce = true and excluded_users_count > 0
  if (idpConfig.excluded_users_count > 0) {
    return `SSO is ${isSummary ? 'enabled and enforced. All users are required to' : 'enforced. All users'} log in with SSO, except for ${idpConfig.excluded_users_count} user${idpConfig.excluded_users_count > 1 ? 's' : ''} listed as exceptions.`;
  }

  // enabled = true and enforce = true and excluded_users_count = 0
  return isSummary
    ? 'SSO is enabled and enforced. All users are required to log in with SSO. There are no SSO user exceptions (not recommended).'
    : 'SSO is enforced. All users log in with SSO.';
};
