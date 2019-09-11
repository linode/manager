import { flatten } from 'ramda';
import { GroupType, Item } from 'src/components/EnhancedSelect';

export const getSelectedOptionFromGroupedOptions = (
  selectedValue: string,
  options: GroupType<any>[]
) => {
  if (!selectedValue) {
    return null;
  }
  // Ramda's flatten doesn't seem able to handle the typing issues here, but this returns an array of Item<T>.
  const optionsList = (flatten(
    options.map(group => group.options)
  ) as unknown) as Item<any>[];
  return optionsList.find(option => option.value === selectedValue) || null;
};
