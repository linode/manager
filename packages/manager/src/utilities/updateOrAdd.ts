import { append, update } from 'ramda';

export default <T extends { id: number | string }>(
  item: T,
  items: T[] = []
) => {
  if (items.length === 0) {
    return [item];
  }

  const found = items.findIndex((i) => i.id === item.id);
  if (found < 0) {
    return append(item, items);
  }

  return update(found, item, items);
};
