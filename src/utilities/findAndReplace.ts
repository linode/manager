import { equals, update } from 'ramda';

/**
 * Will find and replace an item, by ID, only if the item is different than the existing.
 * If it's not found in the list, it will be appended.
 */
export const findAndReplaceOrAppend = <T extends { id: number | string }>(list: T[], item: T): T[] => {
  const foundId = findById(list, item.id);

  if (foundId) {
    if(!equals(list[foundId], item)){
      return update(foundId, item, list);
    }

    return list;
  }

 return [...list, item];
}

export const findById = <T extends { id?: number | string }>(list: T[], id: number | string): undefined | number => {
  let idx = 0
  const len = list.length;

  for (; idx < len; idx++) {
    const e = list[idx];
    if (e.id === id) {
      return idx;
    }
  }

  return;
};
