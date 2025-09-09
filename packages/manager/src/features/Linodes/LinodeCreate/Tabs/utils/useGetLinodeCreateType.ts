import { useLocation } from '@tanstack/react-router';

import type { LinodeCreateType } from '@linode/utilities';
import type { LinkProps } from '@tanstack/react-router';

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
  const { pathname } = useLocation() as { pathname: LinkProps['to'] };

  switch (pathname) {
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
      return 'OS';
  }
};
