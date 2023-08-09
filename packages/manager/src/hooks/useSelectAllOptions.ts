import { useState } from 'react';

import type { OptionType } from 'src/components/Autocomplete/Autocomplete';

export const useSelectAllOptions = <T = any>(
  initialOptions: OptionType<T>[] = []
) => {
  const [selectedOptions, setSelectedOptions] = useState<OptionType<T>[]>(
    initialOptions
  );

  const handleToggleOption = (newSelectedOptions: OptionType<T>[]) =>
    setSelectedOptions(newSelectedOptions);

  const handleClearOptions = () => setSelectedOptions([]);

  const handleSelectAll = (isSelected: boolean, options: OptionType<T>[]) => {
    if (isSelected) {
      setSelectedOptions(options);
    } else {
      handleClearOptions();
    }
  };

  return {
    handleClearOptions,
    handleSelectAll,
    handleToggleOption,
    selectedOptions,
  };
};
