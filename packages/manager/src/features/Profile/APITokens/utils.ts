export type Permission = [string, number];

export const basePerms = [
  'account',
  'domains',
  'events',
  'images',
  'ips',
  'linodes',
  'longview',
  'nodebalancers',
  // @todo: Once Object Storage is safely in GA, uncomment:
  // 'object_storage'
  'stackscripts',
  'volumes'
];

export const basePermNameMap: Record<string, string> = {
  account: 'Account',
  domains: 'Domains',
  events: 'Events',
  images: 'Images',
  ips: 'IPs',
  linodes: 'Linodes',
  longview: 'Longview',
  nodebalancers: 'NodeBalancers',
  // @todo: Once Object Storage is safely in GA, uncomment:
  // object_storage: 'Object Storage'
  stackscripts: 'StackScripts',
  volumes: 'Volumes'
};

export const inverseLevelMap = ['none', 'read_only', 'read_write'];

export const levelMap = {
  none: 0,
  read_only: 1,
  read_write: 2,
  view: 1,
  modify: 2,
  create: 2,
  delete: 2
};

const defaultScopeMap = (perms: string[]): Record<string, 0> =>
  perms.reduce((obj, key) => ({ ...obj, [key]: 0 }), {});

/**
 * This function accepts scopes strings as given by the API, which have the following format:
 * "linodes:delete,domains:modify,nodebalancers:modify,images:create,events:view,clients:view"
 *
 * It returns an array of 2-tuples in alphabetical order by scope name.
 *
 * Each 2-tuple has the format [<scopename>, <number>], where <number> is the permission level
 * of the scope. These are the permission levels in order:
 *
 * None: 0
 * ReadOnly: 1
 * ReadWrite: 2
 *
 * These are old permission levels which must be mapped to the new levels
 * None: 0
 * View: 1
 * Create: 2
 * Modify: 2
 * Delete: 2
 *
 * Each permission level gives a user access to all lower permission levels.
 */

export const scopeStringToPermTuples = (
  scopes: string,
  perms: string[]
): Permission[] => {
  if (scopes === '*') {
    return perms.map(perm => [perm, 2] as Permission);
  }

  const scopeMap = scopes.split(',').reduce((map, scopeStr) => {
    const [perm, level] = scopeStr.split(':');
    return {
      ...map,
      [perm]: levelMap[level]
    };
  }, defaultScopeMap(perms));

  /**
   * So there are deprecated permission types that have been folded into a parent permission. So
   * tokens, clients, etc., are all now under account. However, could potentially still be tokens
   * with the old values (since some tokens never expire... great).
   *
   * So check the scopeMap (generated by the provided scopes) for one of these deprecated types;
   *  { account:read_only, tokens:create }
   * then compare that to the existing account level (say read_only) and update account with
   * the "higher" permission. Oh right, did I mention we have deprecated permission levels too?
   * So read above in Andrews comments about the deprecated levels.
   */
  const deprecatedPermissionsMap: Record<string, string[]> = {
    account: ['tokens', 'clients', 'users', 'tickets', 'managed']
  };

  const combinedScopeMap = Object.entries(deprecatedPermissionsMap).reduce(
    (
      map: Record<string, number>,
      [parentPermissionName, deprecatedPermissions]
    ) => {
      const maxLevel = deprecatedPermissions.reduce(
        (level: number, deprecatedPermission: string) => {
          const deprecatedPermissionLevel = map[deprecatedPermission];

          return deprecatedPermissionLevel
            ? Math.max(level, deprecatedPermissionLevel)
            : level;
        },
        map[parentPermissionName]
      );

      return { ...map, [parentPermissionName]: maxLevel };
    },
    scopeMap
  );

  const permTuples = perms.reduce(
    (tups: Permission[], permName: string): Permission[] => {
      const tup = [permName, combinedScopeMap[permName]] as Permission;
      return [...tups, tup];
    },
    []
  );

  return permTuples;
};

export const allMaxPerm = (
  scopeTups: Permission[],
  perms: string[]
): boolean => {
  if (scopeTups.length !== perms.length) {
    return false;
  }

  return scopeTups.reduce(
    (acc: boolean, [key, value]: Permission) =>
      value === levelMap.read_write && acc,
    true
  );
};

export const permTuplesToScopeString = (
  scopeTups: Permission[],
  perms: string[]
): string => {
  if (allMaxPerm(scopeTups, perms)) {
    return '*';
  }
  const joinedTups = scopeTups.reduce((acc, [key, value]) => {
    const level = inverseLevelMap[value];
    if (level !== 'none') {
      return [...acc, [key, level].join(':')];
    }
    return [...acc];
  }, []);
  return joinedTups.join(',');
};
