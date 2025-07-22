import { useMatch } from '@tanstack/react-router';

import type { LinodeCreateType } from '@linode/utilities';

type LinodeCreatePathSegments =
  | 'backups'
  | 'clone'
  | 'images'
  | 'marketplace'
  | 'os'
  | 'stackscripts';

export const linodesCreateTypesMap = new Map<
  LinodeCreateType,
  LinodeCreatePathSegments
>([
  ['Backups', 'backups'],
  ['Clone Linode', 'clone'],
  ['Images', 'images'],
  ['One-Click', 'marketplace'],
  ['OS', 'os'],
  ['StackScripts', 'stackscripts'],
]);

export const linodesCreateTypes = Array.from(linodesCreateTypesMap.keys());

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
