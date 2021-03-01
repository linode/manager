type Tag = string;
interface Tagged {
  tags: Tag[];
}
interface Grouped {
  group: string;
}
export type GroupedBy<T> = [string, T[]][];

/** The key on which we will store entities without tags. */
export const NONE = `No Tags`;

/** Safely push onto an array. */
const addTo = <T>(list: T[] = [], i: T) => [...list, i];

/**
 * If an entity has no tags, push it onto the none record, otherwise iterate over its
 * tags pushing the entity onto the appropriate record.
 */
const reduceEntitiesToTags = <T extends Tagged>(
  obj: Record<string, T[]>,
  entity: T
): Record<string, T[]> => {
  const { tags } = entity;

  return tags.length === 0
    ? { ...obj, [NONE]: addTo(obj[NONE], entity) }
    : entity.tags.reduce(addToArrayAtKey(entity), obj);
};

/** Literally push a value on an array at a specificed key of an array. */
const addToArrayAtKey = <T>(value: T) => (obj: any, key: string) => {
  return {
    ...obj,
    [key]: addTo(obj[key], value),
  };
};

/** Create a group map based on tags. */
export const groupByTags = <T extends Tagged>(arr: T[]): GroupedBy<T> => {
  const map = arr.reduce(reduceEntitiesToTags, {});

  return Object.entries(map);
};

/** Just in case... */
const reduceEntitiesToGroup = <T extends Grouped>(
  obj: Record<string, T[]>,
  entity: T
): Record<string, T[]> => {
  const { group } = entity;

  return !group || group === ''
    ? { ...obj, [NONE]: addTo(obj[NONE], entity) }
    : { ...obj, [group]: addTo(obj[group], entity) };
};

export const groupByGroup = <T extends Grouped>(arr: T[]): GroupedBy<T> => {
  const map = arr.reduce(reduceEntitiesToGroup, {});

  return Object.entries(map);
};

/**
 * Moves the NONE to the bottom, and alphabetically sorts the remainder.
 */
export const sortGroups = (groups: GroupedBy<any>) => {
  let foundUntaggedIndex;
  let idx = 0;
  const len = groups.length;
  for (; idx < len; idx++) {
    const [tag] = groups[idx];
    if (tag === NONE) {
      foundUntaggedIndex = idx;
      break;
    }
  }

  if (typeof foundUntaggedIndex === 'undefined') {
    return groups.sort(([firstTag], [secondTag]) =>
      firstTag > secondTag ? 0 : -1
    );
  }

  return [
    ...groups
      .filter(([tag]) => tag !== NONE)
      .sort(([firstTag], [secondTag]) => (firstTag > secondTag ? 0 : -1)),
    groups[foundUntaggedIndex],
  ];
};
