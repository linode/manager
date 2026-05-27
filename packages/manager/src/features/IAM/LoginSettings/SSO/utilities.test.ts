import { hasNoValidCertificates } from './utilities';

import type { IdpConfig } from '@linode/api-v4';

const FUTURE_DATE = '2099-01-01T00:00:00.000Z';
const PAST_DATE = '2000-01-01T00:00:00.000Z';

const makeCert = (not_after: string) => ({
  certificate: 'cert',
  created: '2024-01-01T00:00:00.000Z',
  created_by: 'user',
  id: 'cert-id',
  not_after,
  not_before: '2024-01-01T00:00:00.000Z',
});

const makeConfig = (certs: ReturnType<typeof makeCert>[]): IdpConfig => ({
  created: '2024-01-01T00:00:00.000Z',
  created_by: 'user',
  default: true,
  enabled: false,
  enforce: false,
  excluded_users_count: 0,
  id: 'config-id',
  included_users_count: 0,
  label: 'Test IDP',
  saml: {
    entity_id: 'entity-id',
    identity_element: 'NAME_ID',
    idp_url: 'https://idp.example.com',
    public_certificates: certs,
  },
  updated: '2024-01-01T00:00:00.000Z',
  updated_by: 'user',
});

describe('hasNoValidCertificates', () => {
  it('returns true when there are no certificates', () => {
    expect(hasNoValidCertificates(makeConfig([]))).toBe(true);
  });

  it('returns true when there is one expired certificate', () => {
    expect(hasNoValidCertificates(makeConfig([makeCert(PAST_DATE)]))).toBe(
      true
    );
  });

  it('returns false when there is one valid certificate', () => {
    expect(hasNoValidCertificates(makeConfig([makeCert(FUTURE_DATE)]))).toBe(
      false
    );
  });

  it('returns false when there are multiple certificates and at least one is valid', () => {
    expect(
      hasNoValidCertificates(
        makeConfig([makeCert(PAST_DATE), makeCert(FUTURE_DATE)])
      )
    ).toBe(false);
  });

  it('returns true when there are multiple certificates and all are expired', () => {
    expect(
      hasNoValidCertificates(
        makeConfig([makeCert(PAST_DATE), makeCert(PAST_DATE)])
      )
    ).toBe(true);
  });
});
