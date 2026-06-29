import {
  getCertificateCounts,
  getSummaryStatus,
  hasNoValidCertificates,
} from './utilities';

import type { IdpConfig } from '@linode/api-v4';

const FUTURE_DATE = '2099-01-01T00:00:00.000Z';
const PAST_DATE = '2000-01-01T00:00:00.000Z';
const EXPIRING_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
})();
const NOT_YET_VALID_NOT_BEFORE = '2099-01-01T00:00:00.000Z';

const makeCert = (
  not_after: string,
  not_before = '2024-01-01T00:00:00.000Z'
) => ({
  certificate: 'cert',
  created: '2024-01-01T00:00:00.000Z',
  created_by: 'user',
  id: 'cert-id',
  not_after,
  not_before,
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
    identity_element: 'name_id',
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

  it('returns true when one certificate is expired and one is not yet valid', () => {
    expect(
      hasNoValidCertificates(
        makeConfig([
          makeCert(PAST_DATE),
          makeCert(FUTURE_DATE, NOT_YET_VALID_NOT_BEFORE),
        ])
      )
    ).toBe(true);
  });

  it('returns false when there is one expiring-soon certificate', () => {
    expect(hasNoValidCertificates(makeConfig([makeCert(EXPIRING_DATE)]))).toBe(
      false
    );
  });

  it('returns true when there is one not-yet-valid certificate', () => {
    expect(
      hasNoValidCertificates(
        makeConfig([makeCert(FUTURE_DATE, NOT_YET_VALID_NOT_BEFORE)])
      )
    ).toBe(true);
  });
});

describe('getCertificateCounts', () => {
  it('returns all zeros for an empty array', () => {
    expect(getCertificateCounts([])).toEqual({
      activeCertificatesCount: 0,
      activeOnlyCount: 0,
      expiredCount: 0,
      expiringCount: 0,
    });
  });

  it('counts a single active certificate correctly', () => {
    expect(getCertificateCounts([makeCert(FUTURE_DATE)])).toEqual({
      activeCertificatesCount: 1,
      activeOnlyCount: 1,
      expiredCount: 0,
      expiringCount: 0,
    });
  });

  it('counts a single expiring-soon certificate correctly', () => {
    expect(getCertificateCounts([makeCert(EXPIRING_DATE)])).toEqual({
      activeCertificatesCount: 1,
      activeOnlyCount: 0,
      expiredCount: 0,
      expiringCount: 1,
    });
  });

  it('counts a single expired certificate correctly', () => {
    expect(getCertificateCounts([makeCert(PAST_DATE)])).toEqual({
      activeCertificatesCount: 0,
      activeOnlyCount: 0,
      expiredCount: 1,
      expiringCount: 0,
    });
  });

  it('counts a mix of expired, expiring, and active certificates correctly', () => {
    expect(
      getCertificateCounts([
        makeCert(PAST_DATE),
        makeCert(EXPIRING_DATE),
        makeCert(FUTURE_DATE),
      ])
    ).toEqual({
      activeCertificatesCount: 2,
      activeOnlyCount: 1,
      expiredCount: 1,
      expiringCount: 1,
    });
  });

  it('counts a not-yet-valid certificate as inactive (excluded from activeCertificatesCount)', () => {
    expect(
      getCertificateCounts([makeCert(FUTURE_DATE, NOT_YET_VALID_NOT_BEFORE)])
    ).toEqual({
      activeCertificatesCount: 0,
      activeOnlyCount: 0,
      expiredCount: 1,
      expiringCount: 0,
    });
  });

  it('correctly counts a mix including a not-yet-valid certificate', () => {
    expect(
      getCertificateCounts([
        makeCert(PAST_DATE),
        makeCert(FUTURE_DATE, NOT_YET_VALID_NOT_BEFORE),
        makeCert(EXPIRING_DATE),
        makeCert(FUTURE_DATE),
      ])
    ).toEqual({
      activeCertificatesCount: 2,
      activeOnlyCount: 1,
      expiredCount: 2,
      expiringCount: 1,
    });
  });
});

describe('getSummaryStatus', () => {
  it('returns not-configured message when idpConfig is null', () => {
    expect(getSummaryStatus(null)).toBe(
      'SSO is not configured for this account.'
    );
  });

  it('returns disabled message when enabled is false', () => {
    expect(getSummaryStatus(makeConfig([]))).toBe(
      'SSO is disabled. All users log in using alternative methods.'
    );
  });

  it('returns disabled message when enabled is false for summary', () => {
    expect(getSummaryStatus(makeConfig([]), true)).toBe(
      'SSO is disabled and not enforced. All users log in using alternative methods.'
    );
  });

  it('returns not-enforced message when enabled and enforce are false and included_users_count is 0', () => {
    expect(
      getSummaryStatus({
        ...makeConfig([]),
        enabled: true,
        enforce: false,
        included_users_count: 0,
      })
    ).toBe(
      'SSO is enabled but not enforced. All users log in using alternative methods.'
    );
  });

  it('returns not-enforced message when enabled and enforce are false and included_users_count is 0 for summary', () => {
    expect(
      getSummaryStatus(
        {
          ...makeConfig([]),
          enabled: true,
          enforce: false,
          included_users_count: 0,
        },
        true
      )
    ).toBe(
      'SSO is enabled but not enforced for any users. All users log in using alternative methods.'
    );
  });

  it('returns partial enforcement message when enabled is true, enforce is false, and included_users_count > 0', () => {
    expect(
      getSummaryStatus({
        ...makeConfig([]),
        enabled: true,
        enforce: false,
        included_users_count: 3,
      })
    ).toBe(
      'SSO is enforced for 3 users. All remaining users can log in using alternative methods.'
    );
  });

  it('returns partial enforcement message when enabled is true, enforce is false, and included_users_count > 0 for summary', () => {
    expect(
      getSummaryStatus(
        {
          ...makeConfig([]),
          enabled: true,
          enforce: false,
          included_users_count: 3,
        },
        true
      )
    ).toBe(
      'SSO is enabled and required for 3 users. All remaining users can log in using alternative methods.'
    );
  });

  it('returns full enforcement message when enabled and enforce are true and excluded_users_count is 0', () => {
    expect(
      getSummaryStatus({
        ...makeConfig([]),
        enabled: true,
        enforce: true,
        excluded_users_count: 0,
      })
    ).toBe('SSO is enforced. All users log in with SSO.');
  });

  it('returns full enforcement message when enabled and enforce are true and excluded_users_count is 0 for summary', () => {
    expect(
      getSummaryStatus(
        {
          ...makeConfig([]),
          enabled: true,
          enforce: true,
          excluded_users_count: 0,
        },
        true
      )
    ).toBe(
      'SSO is enabled and enforced. All users are required to log in with SSO. There are no SSO user exceptions (not recommended).'
    );
  });

  it('returns enforcement-with-exclusions message when enabled and enforce are true and excluded_users_count > 0', () => {
    expect(
      getSummaryStatus({
        ...makeConfig([]),
        enabled: true,
        enforce: true,
        excluded_users_count: 5,
      })
    ).toBe(
      'SSO is enforced. All users log in with SSO, except for 5 users listed as exceptions.'
    );
  });

  it('returns enforcement-with-exclusions message when enabled and enforce are true and excluded_users_count > 0 for summary', () => {
    expect(
      getSummaryStatus(
        {
          ...makeConfig([]),
          enabled: true,
          enforce: true,
          excluded_users_count: 5,
        },
        true
      )
    ).toBe(
      'SSO is enabled and enforced. All users are required to log in with SSO, except for 5 users listed as exceptions.'
    );
  });
});
