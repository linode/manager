import { Linode } from '@linode/api-v4';

import { isNotNullOrUndefined } from './nullOrUndefined';

export const mapIdsToLinodes = (
  ids: null | number | number[],
  linodes: Linode[] = []
): Linode | Linode[] | null => {
  const linodeMap = new Map(linodes.map((linode) => [linode.id, linode]));
  if (Array.isArray(ids)) {
    return ids.map((id) => linodeMap.get(id)).filter(isNotNullOrUndefined);
  } else if (ids !== null) {
    return linodeMap.get(ids) ?? null;
  } else {
    return null;
  }
};
