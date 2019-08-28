import { Item } from 'src/components/EnhancedSelect/Select';

export const getItemFromID = (items: Item<string>[], id?: string) => {
  return items.find(thisItem => thisItem.value === id) || null;
};
