import * as React from 'react';

import {
  expectNotificationBannerText,
  getShadowRootElement,
  mockMatchMedia,
  renderWithProviders,
} from '../../../utilities/testHelpers';
import {
  SSO_EXPIRED_ENFORCED,
  SSO_EXPIRING,
  SSO_REQUIRES_ACTIVE_CERTIFICATE,
} from '../../constants';
import { IdpConfigurations } from './IdpConfigurations';

import type { IdpCertificate, IdpConfig, IdpSamlConfig } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  usePermissions: vi.fn(),
  useCreateIdpCertificateMutation: vi
    .fn()
    .mockReturnValue({ mutateAsync: vi.fn() }),
  useCreateIdpConfigMutation: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useUpdateIdpConfigMutation: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useDeleteIdpConfigMutation: vi
    .fn()
    .mockReturnValue({ mutateAsync: vi.fn(), reset: vi.fn() }),
  useDeleteIdpCertificateMutation: vi
    .fn()
    .mockReturnValue({ mutateAsync: vi.fn(), reset: vi.fn() }),
  usePreferences: vi.fn(),
  useProfile: vi.fn().mockReturnValue({ data: { timezone: 'UTC' } }),
  useSnackbar: vi.fn().mockReturnValue({ enqueueSnackbar: vi.fn() }),
}));

vi.mock('../../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../../hooks/usePermissions');
  return { ...actual, usePermissions: queryMocks.usePermissions };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useCreateIdpCertificateMutation: queryMocks.useCreateIdpCertificateMutation,
    useCreateIdpConfigMutation: queryMocks.useCreateIdpConfigMutation,
    useUpdateIdpConfigMutation: queryMocks.useUpdateIdpConfigMutation,
    useDeleteIdpConfigMutation: queryMocks.useDeleteIdpConfigMutation,
    useDeleteIdpCertificateMutation: queryMocks.useDeleteIdpCertificateMutation,
    usePreferences: queryMocks.usePreferences,
    useProfile: queryMocks.useProfile,
  };
});

// 200 days → 'active'; 30 days → 'other' (expiring); yesterday → 'error' (expired)
const ACTIVE_DATE = new Date(
  Date.now() + 200 * 24 * 60 * 60 * 1000
).toISOString();
const EXPIRING_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
).toISOString();
const EXPIRED_DATE = new Date(
  Date.now() - 1 * 24 * 60 * 60 * 1000
).toISOString();
const VALID_NOT_BEFORE = new Date(
  Date.now() - 365 * 24 * 60 * 60 * 1000
).toISOString();
// not_before in the future → status 'inactive' (not yet valid)
const NOT_YET_VALID_NOT_BEFORE = new Date(
  Date.now() + 10 * 24 * 60 * 60 * 1000
).toISOString();

const CREATED_DATE = '2024-01-01T00:00:00.000Z';

const makeCert = (
  notAfter: string,
  overrides: Partial<IdpCertificate> = {}
): IdpCertificate => ({
  certificate: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
  created: CREATED_DATE,
  created_by: 'user',
  id: 'cert-id',
  not_after: notAfter,
  not_before: VALID_NOT_BEFORE,
  ...overrides,
});

const BASE_SAML: IdpSamlConfig = {
  entity_id: 'entity-id',
  identity_element: 'name_id',
  idp_url: 'https://idp.example.com',
  public_certificates: [],
};

const makeIdpConfig = (overrides: Partial<IdpConfig> = {}): IdpConfig => ({
  created: CREATED_DATE,
  created_by: 'user',
  default: true,
  enabled: false,
  enforce: false,
  excluded_users_count: 0,
  id: 'config-id',
  included_users_count: 0,
  label: 'Test IDP',
  saml: BASE_SAML,
  updated: CREATED_DATE,
  updated_by: 'user',
  ...overrides,
});

/** Returns shadow-DOM delete buttons from the certificates table rows only. */
const getDeleteButtons = async (
  root: ParentNode
): Promise<HTMLButtonElement[]> => {
  const table = root.querySelector('[aria-label="SAML Certificates"]') ?? root;
  const hosts = Array.from(
    table.querySelectorAll<HTMLElement>('cds-button')
  ).filter(
    (btn) =>
      btn.textContent?.trim().startsWith('Delete') &&
      !btn.textContent?.includes('IDP') &&
      !btn.textContent?.includes('Certificate')
  );
  const shadowButtons = await Promise.all(
    hosts.map((host) => getShadowRootElement<HTMLButtonElement>(host, 'button'))
  );
  return shadowButtons.filter((btn): btn is HTMLButtonElement => btn !== null);
};

describe('IdpConfigurations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockMatchMedia();
    queryMocks.usePermissions.mockReturnValue({
      data: {
        delete_idp_config: true,
        delete_idp_config_cert: true,
        update_idp_config: true,
        create_idp_config_cert: true,
      },
    });
    queryMocks.usePreferences.mockReturnValue({ data: true });
    queryMocks.useProfile.mockReturnValue({ data: { timezone: 'UTC' } });
    queryMocks.useSnackbar.mockReturnValue({ enqueueSnackbar: vi.fn() });
    queryMocks.useCreateIdpCertificateMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
    queryMocks.useCreateIdpConfigMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
    queryMocks.useUpdateIdpConfigMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
    queryMocks.useDeleteIdpConfigMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    });
    queryMocks.useDeleteIdpCertificateMutation.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    });
  });

  describe('Notification Banner', () => {
    const getSsoBannerText = () => {
      const banners = Array.from(
        document.querySelectorAll<HTMLElement>('cds-notification-banner')
      );
      return banners
        .map((b) => b.shadowRoot?.textContent ?? b.textContent ?? '')
        .join(' ');
    };

    it('does not show a banner when SSO is disabled', () => {
      renderWithProviders(
        <IdpConfigurations idpConfig={makeIdpConfig({ enabled: false })} />
      );

      const text = getSsoBannerText();
      expect(text).not.toContain(SSO_REQUIRES_ACTIVE_CERTIFICATE);
      expect(text).not.toContain(SSO_EXPIRING);
      expect(text).not.toContain(SSO_EXPIRED_ENFORCED);
    });

    it('does not show a banner when SSO is enabled and there are active certificates', () => {
      renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: {
              ...BASE_SAML,
              public_certificates: [makeCert(ACTIVE_DATE)],
            },
          })}
        />
      );

      const text = getSsoBannerText();
      expect(text).not.toContain(SSO_REQUIRES_ACTIVE_CERTIFICATE);
      expect(text).not.toContain(SSO_EXPIRING);
      expect(text).not.toContain(SSO_EXPIRED_ENFORCED);
    });

    it('shows the requires-active-certificate banner when SSO is enabled but has no certificates', async () => {
      renderWithProviders(
        <IdpConfigurations idpConfig={makeIdpConfig({ enabled: true })} />
      );

      await expectNotificationBannerText(SSO_REQUIRES_ACTIVE_CERTIFICATE);
    });

    it('shows the expiring banner when SSO is enabled and all certificates are expiring soon', async () => {
      renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: {
              ...BASE_SAML,
              public_certificates: [makeCert(EXPIRING_DATE)],
            },
          })}
        />
      );

      await expectNotificationBannerText(SSO_EXPIRING);
    });

    it('shows the expired-enforced banner when SSO is enabled and all certificates are expired', async () => {
      renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: {
              ...BASE_SAML,
              public_certificates: [makeCert(EXPIRED_DATE)],
            },
          })}
        />
      );

      await expectNotificationBannerText(SSO_EXPIRED_ENFORCED);
    });
  });

  describe('CertificatesTable – delete button', () => {
    it('is disabled when SSO is enabled and only one certificate exists', async () => {
      const { container } = renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: {
              ...BASE_SAML,
              public_certificates: [makeCert(ACTIVE_DATE)],
            },
          })}
        />
      );

      const [deleteButton] = await getDeleteButtons(container);
      expect(deleteButton).toBeDisabled();
    });

    it('disables delete only for the last valid certificate when an expired cert and a not-yet-valid cert also exist', async () => {
      const activeCert = makeCert(ACTIVE_DATE, {
        id: 'active',
        certificate: 'ACTIVECERTACTIVECERTACTIVECERT12',
      });
      const expiredCert = makeCert(EXPIRED_DATE, {
        id: 'expired',
        certificate: 'EXPIREDCERTEXPIREDCERTEXPIREDC12',
      });
      // not_before in the future → status 'inactive'; not counted as a valid cert
      const notYetValidCert = makeCert(ACTIVE_DATE, {
        id: 'not-yet-valid',
        certificate: 'NOTVALIDCERTNOTVALIDCERTNOTVAL12',
        not_before: NOT_YET_VALID_NOT_BEFORE,
      });

      const { container } = renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: {
              ...BASE_SAML,
              public_certificates: [activeCert, expiredCert, notYetValidCert],
            },
          })}
        />
      );

      const deleteButtons = await getDeleteButtons(container);
      expect(deleteButtons).toHaveLength(3);

      const disabledCount = deleteButtons.filter((btn) => btn.disabled).length;
      // Only the active cert's delete button should be disabled (last valid cert);
      // expired and not-yet-valid certs don't count toward the valid-cert threshold.
      expect(disabledCount).toBe(1);
    });

    it('enables delete for all rows when multiple valid certificates exist', async () => {
      const cert1 = makeCert(ACTIVE_DATE, {
        id: 'cert-1',
        certificate: 'CERT1CERT1CERT1CERT1CERT1CERT112',
      });
      const cert2 = makeCert(ACTIVE_DATE, {
        id: 'cert-2',
        certificate: 'CERT2CERT2CERT2CERT2CERT2CERT212',
      });

      const { container } = renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            enabled: true,
            saml: { ...BASE_SAML, public_certificates: [cert1, cert2] },
          })}
        />
      );

      const deleteButtons = await getDeleteButtons(container);
      expect(deleteButtons).toHaveLength(2);

      const disabledCount = deleteButtons.filter((btn) => btn.disabled).length;
      expect(disabledCount).toBe(0);
    });

    it('is disabled for all rows when user lacks admin permission', async () => {
      queryMocks.usePermissions.mockReturnValue({
        data: {
          delete_idp_config: false,
          update_idp_config: false,
          create_idp_config_cert: false,
        },
      });

      const cert1 = makeCert(ACTIVE_DATE, {
        id: 'cert-1',
        certificate: 'CERT1CERT1CERT1CERT1CERT1CERT112',
      });
      const cert2 = makeCert(ACTIVE_DATE, {
        id: 'cert-2',
        certificate: 'CERT2CERT2CERT2CERT2CERT2CERT212',
      });

      const { container } = renderWithProviders(
        <IdpConfigurations
          idpConfig={makeIdpConfig({
            saml: { ...BASE_SAML, public_certificates: [cert1, cert2] },
          })}
        />
      );

      const deleteButtons = await getDeleteButtons(container);
      expect(deleteButtons).toHaveLength(2);

      const disabledCount = deleteButtons.filter((btn) => btn.disabled).length;
      expect(disabledCount).toBe(2);
    });
  });
});
