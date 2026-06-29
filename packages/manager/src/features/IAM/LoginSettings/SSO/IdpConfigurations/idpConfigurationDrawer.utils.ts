import type { Status } from '../../../Shared/StatusIcon/StatusIcon';
import type { CreateIdpConfigPayload, IdentityElement } from '@linode/api-v4';

export type DrawerMode = 'create' | 'edit';

export interface IdentityElementOption {
  label: string;
  value: IdentityElement;
}

export const identityElementOptions: IdentityElementOption[] = [
  { label: 'User ID Attribute', value: 'user_id_attribute' },
  { label: 'Name ID', value: 'name_id' },
];

export const defaultValues: CreateIdpConfigPayload = {
  default: false,
  enabled: false,
  enforce: false,
  label: '',
  saml: {
    entity_id: '',
    identity_element: '' as IdentityElement,
    idp_url: '',
    public_certificates: [{ certificate: '' }],
  },
};

export interface CertificateInfo {
  status: Status;
  text: 'Expired' | 'Expiring Soon' | 'Not Yet Valid' | 'Valid';
}

/**
 * Returns both a status and a label based on the certificate's validity window.
 * - 'inactive' / 'Not Yet Valid' — notBefore is in the future (optional)
 * - 'error'    / 'Expired'       — notAfter is in the past
 * - 'other'    / 'Expiring Soon' — notAfter is within the next 90 days
 * - 'active'   / 'Valid'         — valid for more than 90 days
 */
export const getCertificateStatus = (
  notAfter: string,
  notBefore?: string
): CertificateInfo => {
  const now = new Date();

  if (notBefore && new Date(notBefore) > now) {
    return { status: 'inactive', text: 'Not Yet Valid' };
  }

  const expirationDate = new Date(notAfter);

  if (expirationDate <= now) {
    return { status: 'error', text: 'Expired' };
  }

  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  if (expirationDate <= ninetyDaysFromNow) {
    return { status: 'other', text: 'Expiring Soon' };
  }

  return { status: 'active', text: 'Valid' };
};
