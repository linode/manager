import { adjust } from 'ramda';

export default <T extends { id: string | number }>(
  updater: (v: T) => T,
  id: number,
  list: T[]
) => {
  if (list.length === 0) {
    return list;
  }

  const foundIndex = list.findIndex(l => l.id === id);
  if (foundIndex < 0) {
    return list;
  }

  return adjust(updater, foundIndex, list);
};
