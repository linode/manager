import { flatten } from 'ramda';

import type { SelectOption } from '@linode/ui';

type OptionGroup<T = number | string> = {
  label: string;
  options: SelectOption<T>[];
};

export const getSelectedOptionFromGroupedOptions = (
  selectedValue: string,
  options: OptionGroup<unknown>[]
) => {
  if (!selectedValue) {
    return null;
  }
  // Ramda's flatten doesn't seem able to handle the typing issues here, but this returns an array of Item<T>.
  const optionsList = (flatten(
    options.map((group) => group.options)
  ) as unknown) as SelectOption<unknown>[];
  return optionsList.find((option) => option.value === selectedValue) || null;
};
