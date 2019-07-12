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

  /**
   * the current Ramda docs tell you that the
   * foundIndex should be the first argument, but
   * our version of ramda has these switched
   *
   * At the time of this comment, we have:
   *
   * ramda: ^0.25.0
   * @types/ramda: 0.25.16 (0.25.17 switches the argument order)
   */
  return adjust(updater, foundIndex, list);
};
