import { DateTime } from 'luxon';

import { ExcludedScope } from './CreateAPITokenDrawer';
import {
  Permission,
  allScopesAreTheSame,
  hasAccessBeenSelectedForAllScopes,
  isWayInTheFuture,
  scopeStringToPermTuples,
} from './utils';

describe('isWayInTheFuture', () => {
  it('should return true if past 100 years in the future', () => {
    const todayPlus101Years = DateTime.local().plus({ years: 101 }).toISO();

    expect(isWayInTheFuture(todayPlus101Years)).toBeTruthy();
  });

  it('should return false for years under 100 years in the future', () => {
    const todayPlus55Years = DateTime.local().plus({ years: 55 }).toISO();
    expect(isWayInTheFuture(todayPlus55Years)).toBeFalsy();
  });
});

describe('APIToken utils', () => {
  describe('scopeStringToPermTuples', () => {
    describe('when given `*` scopes', () => {
      const result = scopeStringToPermTuples('*');
      const expected = [
        ['account', 2],
        ['child_account', 2],
        ['databases', 2],
        ['domains', 2],
        ['events', 2],
        ['firewall', 2],
        ['images', 2],
        ['ips', 2],
        ['linodes', 2],
        ['lke', 2],
        ['longview', 2],
        ['monitor', 2],
        ['nodebalancers', 2],
        ['object_storage', 2],
        ['stackscripts', 2],
        ['volumes', 2],
        ['vpc', 2],
      ];
      it('should return an array containing a tuple for each type and a permission level of 2', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given no scopes', () => {
      const result = scopeStringToPermTuples('');
      const expected = [
        ['account', 0],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return an array containing a tuple for each type and a permission level of 0', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:none`', () => {
      const result = scopeStringToPermTuples('account:none');
      const expected = [
        ['account', 0],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return account:0', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:read_only`', () => {
      const result = scopeStringToPermTuples('account:read_only');
      const expected = [
        ['account', 1],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return account:1', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:read_write`', () => {
      const result = scopeStringToPermTuples('account:read_write');
      const expected = [
        ['account', 2],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return account:2', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `domains:read_only,longview:read_write`', () => {
      const result = scopeStringToPermTuples(
        'domains:read_only,longview:read_write'
      );
      const expected = [
        ['account', 0],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 1],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 2],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should domain:1 and longview:2', () => {
        expect(result).toEqual(expected);
      });
    });

    /**
     * Handling deprecated types. In this case the user has none (0) account access
     * but they have tokens read_write (2), so we have to set account to the higher.
     */
    describe('when given a scope of `account:none,tokens:read_write`', () => {
      const result = scopeStringToPermTuples('account:none,tokens:read_write');
      const expected = [
        ['account', 2],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return the higher value for account.', () => {
        expect(result).toEqual(expected);
      });
    });

    /**
     * Handling deprecated types. In this case the user has read_write (1) account access
     * but they have tokens none (0), so we have to set account to the higher.
     */
    describe('when given a scope of `account:read_write,tokens:none`', () => {
      const result = scopeStringToPermTuples('account:read_only,tokens:none');
      const expected = [
        ['account', 1],
        ['child_account', 0],
        ['databases', 0],
        ['domains', 0],
        ['events', 0],
        ['firewall', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['lke', 0],
        ['longview', 0],
        ['monitor', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0],
        ['vpc', 0],
      ];

      it('should return the higher value for account.', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('allScopesAreTheSame', () => {
      it('should return 0 if all scopes are 0', () => {
        const scopes: Permission[] = [
          ['account', 0],
          ['child_account', 0],
          ['databases', 0],
          ['domains', 0],
          ['events', 0],
          ['firewall', 0],
          ['images', 0],
          ['ips', 0],
          ['linodes', 0],
          ['lke', 0],
          ['longview', 0],
          ['monitor', 0],
          ['nodebalancers', 0],
          ['object_storage', 0],
          ['stackscripts', 0],
          ['volumes', 0],
          ['vpc', 0],
        ];
        expect(allScopesAreTheSame(scopes)).toBe(0);
      });
      it('should return 1 if all scopes are 1', () => {
        const scopes: Permission[] = [
          ['account', 1],
          ['child_account', 1],
          ['databases', 1],
          ['domains', 1],
          ['events', 1],
          ['firewall', 1],
          ['images', 1],
          ['ips', 1],
          ['linodes', 1],
          ['lke', 1],
          ['longview', 1],
          ['monitor', 1],
          ['nodebalancers', 1],
          ['object_storage', 1],
          ['stackscripts', 1],
          ['volumes', 1],
        ];
        expect(allScopesAreTheSame(scopes)).toBe(1);
      });
      it('should return 2 if all scopes are 2', () => {
        const scopes: Permission[] = [
          ['account', 2],
          ['child_account', 2],
          ['databases', 2],
          ['domains', 2],
          ['events', 2],
          ['firewall', 2],
          ['images', 2],
          ['ips', 2],
          ['linodes', 2],
          ['lke', 2],
          ['longview', 2],
          ['monitor', 2],
          ['nodebalancers', 2],
          ['object_storage', 2],
          ['stackscripts', 2],
          ['volumes', 2],
          ['vpc', 2],
        ];
        expect(allScopesAreTheSame(scopes)).toBe(2);
      });
      it('should return null if all scopes are different', () => {
        const scopes: Permission[] = [
          ['account', 1],
          ['child_account', 0],
          ['databases', 0],
          ['domains', 2],
          ['events', 0],
          ['firewall', 0],
          ['images', 2],
          ['ips', 2],
          ['linodes', 1],
          ['lke', 2],
          ['longview', 2],
          ['monitor', 2],
          ['nodebalancers', 0],
          ['object_storage', 2],
          ['stackscripts', 2],
          ['volumes', 2],
          ['vpc', 0],
        ];
        expect(allScopesAreTheSame(scopes)).toBe(null);
      });
    });
    it('should return 1 if all scopes, except any exclusions, are 1', () => {
      const scopes: Permission[] = [
        ['account', 1],
        ['child_account', 1],
        ['databases', 1],
        ['domains', 1],
        ['events', 1],
        ['firewall', 1],
        ['images', 1],
        ['ips', 1],
        ['linodes', 1],
        ['lke', 1],
        ['longview', 2],
        ['monitor', 1],
        ['nodebalancers', 1],
        ['object_storage', 1],
        ['stackscripts', 1],
        ['volumes', 1],
        ['vpc', 0],
      ];
      const excludedScopeNames: ExcludedScope[] = [
        {
          defaultAccessLevel: 0,
          invalidAccessLevels: [1],
          name: 'vpc',
        },
        {
          defaultAccessLevel: 2,
          invalidAccessLevels: [1],
          name: 'longview',
        },
      ];
      expect(allScopesAreTheSame(scopes, excludedScopeNames)).toBe(1);
    });
  });
});

describe('hasAccessBeenSelectedForAllScopes', () => {
  const defaultScopes: Permission[] = [
    ['account', -1],
    ['child_account', -1],
    ['databases', -1],
    ['domains', -1],
    ['events', -1],
    ['firewall', -1],
    ['images', -1],
    ['ips', -1],
    ['linodes', -1],
    ['lke', -1],
    ['longview', -1],
    ['monitor', -1],
    ['nodebalancers', -1],
    ['object_storage', -1],
    ['stackscripts', -1],
    ['volumes', -1],
    ['vpc', -1],
  ];

  const missingSelectionScopes: Permission[] = [
    ['account', -1],
    ['child_account', -1],
    ['databases', -1],
    ['domains', -1],
    ['events', -1],
    ['firewall', -1],
    ['images', -1],
    ['ips', -1],
    ['linodes', -1],
    ['lke', -1],
    ['longview', -1],
    ['monitor', -1],
    ['nodebalancers', -1],
    ['object_storage', -1],
    ['stackscripts', -1],
    ['volumes', -1],
    ['vpc', 0],
  ];

  const allSelectedScopes: Permission[] = [
    ['account', 1],
    ['child_account', 0],
    ['databases', 0],
    ['domains', 0],
    ['events', 0],
    ['firewall', 0],
    ['images', 0],
    ['ips', 0],
    ['linodes', 2],
    ['lke', 0],
    ['longview', 0],
    ['monitor', 0],
    ['nodebalancers', 0],
    ['object_storage', 0],
    ['stackscripts', 0],
    ['volumes', 0],
    ['vpc', 0],
  ];

  const allExceptChildAccountSelectedScopes: Permission[] = [
    ...allSelectedScopes,
    ['child_account', -1],
  ];

  it('should return false if scopes are all set to a default of no selection', () => {
    expect(hasAccessBeenSelectedForAllScopes(defaultScopes)).toBe(false);
  });
  it('should return false if at least one scope does not have a selection', () => {
    expect(hasAccessBeenSelectedForAllScopes(missingSelectionScopes)).toBe(
      false
    );
  });
  it('should return true if all scopes have a valid selection', () => {
    expect(hasAccessBeenSelectedForAllScopes(allSelectedScopes)).toBe(true);
  });
  it('should return true if all scopes except those excluded have a valid selection', () => {
    expect(
      hasAccessBeenSelectedForAllScopes(allExceptChildAccountSelectedScopes, [
        'child_account',
      ])
    ).toBe(true);
  });
});
