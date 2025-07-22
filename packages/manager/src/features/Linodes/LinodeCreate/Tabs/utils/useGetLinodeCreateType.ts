import { useMatch } from '@tanstack/react-router';

import type { LinodeCreateType } from '@linode/utilities';

export const linodesCreateTypesMap = new Map<LinodeCreateType, string>([
  ['Backups', 'backups'],
  ['Clone Linode', 'clone'],
  ['Images', 'images'],
  ['One-Click', 'one-click'],
  ['OS', 'os'],
  ['StackScripts', 'stackscripts'],
]);

export const linodesCreateTypes = Array.from(linodesCreateTypesMap.keys());

export const linodesCreateTypesMapReverse = new Map<string, string>(
  linodesCreateTypes.map((type) => [linodesCreateTypesMap.get(type)!, type])
);

export const useGetLinodeCreateType = () => {
  const match = useMatch({
    strict: false,
  });

  switch (match.routeId) {
    case '/linodes/create/backups':
      return 'Backups';
    case '/linodes/create/clone':
      return 'Clone Linode';
    case '/linodes/create/images':
      return 'Images';
    case '/linodes/create/marketplace':
      return 'One-Click';
    case '/linodes/create/os':
      return 'OS';
    case '/linodes/create/stackscripts':
      return 'StackScripts';
    default:
      return 'Backups';
  }
};
