import { basePerms, scopeStringToPermTuples } from './utils';

describe('APIToken utils', () => {
  describe('scopeStringToPermTuples', () => {
    describe('when given `*` scopes', () => {
      const result = scopeStringToPermTuples('*', basePerms);
      const expected = [
        ['account', 2],
        ['domains', 2],
        ['events', 2],
        ['images', 2],
        ['ips', 2],
        ['linodes', 2],
        ['longview', 2],
        ['nodebalancers', 2],
        ['object_storage', 2],
        ['stackscripts', 2],
        ['volumes', 2]
      ];
      it('should return an array containing a tuple for each type and a permission level of 2', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given no scopes', () => {
      const result = scopeStringToPermTuples('', basePerms);
      const expected = [
        ['account', 0],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
      ];

      it('should return an array containing a tuple for each type and a permission level of 0', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:none`', () => {
      const result = scopeStringToPermTuples('account:none', basePerms);
      const expected = [
        ['account', 0],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
      ];

      it('should return account:0', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:read_only`', () => {
      const result = scopeStringToPermTuples('account:read_only', basePerms);
      const expected = [
        ['account', 1],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
      ];

      it('should return account:1', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `account:read_write`', () => {
      const result = scopeStringToPermTuples('account:read_write', basePerms);
      const expected = [
        ['account', 2],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
      ];

      it('should return account:2', () => {
        expect(result).toEqual(expected);
      });
    });

    describe('when given a scope of `domains:read_only,longview:read_write`', () => {
      const result = scopeStringToPermTuples(
        'domains:read_only,longview:read_write',
        basePerms
      );
      const expected = [
        ['account', 0],
        ['domains', 1],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 2],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
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
      const result = scopeStringToPermTuples(
        'account:none,tokens:read_write',
        basePerms
      );
      const expected = [
        ['account', 2],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
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
      const result = scopeStringToPermTuples(
        'account:read_only,tokens:none',
        basePerms
      );
      const expected = [
        ['account', 1],
        ['domains', 0],
        ['events', 0],
        ['images', 0],
        ['ips', 0],
        ['linodes', 0],
        ['longview', 0],
        ['nodebalancers', 0],
        ['object_storage', 0],
        ['stackscripts', 0],
        ['volumes', 0]
      ];

      it('should return the higher value for account.', () => {
        expect(result).toEqual(expected);
      });
    });
  });
});
