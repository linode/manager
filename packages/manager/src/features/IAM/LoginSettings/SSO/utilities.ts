import type { IdpConfig } from '@linode/api-v4';

// Determine if there is no valid certificates: either there are no certificates at all,
//  or all certificates are expired.
export const hasNoValidCertificates = (idpConfig: IdpConfig) => {
  const certs = idpConfig.saml.public_certificates;

  if (certs.length === 0) return true;

  const now = new Date().toISOString();
  return certs.every((cert) => cert.not_after < now);
};
