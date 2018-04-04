export type Permission = [string, number];


export const perms = [
  'account',
  'domains',
  'events',
  'images',
  'ips',
  'linodes',
  'longview',
  'nodebalancers',
  'stackscripts',
  'volumes',
];

export const inverseLevelMap = [
  'none',
  'read_only',
  'read_write',
];

export const levelMap = {
  none: 0,
  read_only: 1,
  read_write: 2,
  view: 1,
  modify: 2,
  create: 2,
  delete: 2,
};

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
export function scopeStringToPermTuples(scopes: string): Permission[] {
  if (scopes === '*') {
    return perms.map(perm => [perm, 2] as Permission);
  }

  const scopeMap = scopes.split(',').reduce(
    (map, scopeStr) => {
      const scopeTuple = scopeStr.split(':');
      scopeTuple[1] = levelMap[scopeTuple[1]];
      map[scopeTuple[0]] = scopeTuple[1];
      return map;
    },
    {},
  );

  const equivalentPerms = {
    account: [
      'tokens',
      'clients',
      'users',
      'tickets',
      'managed',
    ],
  };

  /* TODO: Remove this logic once the API starts doing the deprecation mapping for us */
  const combinedScopeMap = Object.keys(equivalentPerms).reduce(
    (map: { [perm: string]: number }, perm: string) => {
      const maxLevel = equivalentPerms[perm].reduce(
        (level: number, eqPerm: string) => {
          return Math.max(level, map[eqPerm] || levelMap['none']);
        },
        map[perm] || levelMap['none'],
      );
      map[perm] = maxLevel;
      return map;
    },
    scopeMap,
  );

  const permTuples = perms.reduce(
    (tups: Permission[], permName: string): Permission[] => {
      const tup = [
        permName,
        combinedScopeMap[permName] || levelMap['none'],
      ] as Permission;
      return [...tups, tup];
    },
    [],
  );

  return permTuples;
}

export function allMaxPerm(scopeTups: Permission[]) : boolean {
  if (scopeTups.length !== perms.length) {
    return false;
  }
  return scopeTups.reduce(
    (acc: boolean, scopeTup: Permission) => {
      return (scopeTup[1] === levelMap.read_write) && acc;
    },
    true,
  );
}

export function permTuplesToScopeString(scopeTups: Permission[]): string {
  if (allMaxPerm(scopeTups)) {
    return '*';
  }
  const joinedTups = scopeTups.reduce(
    (acc, tup) => {
      const level = inverseLevelMap[tup[1]];
      if (level !== 'none') {
        return [...acc, [tup[0], level].join(':')];
      }
      return [...acc];
    },
    [],
  );
  return joinedTups.join(',');
}
