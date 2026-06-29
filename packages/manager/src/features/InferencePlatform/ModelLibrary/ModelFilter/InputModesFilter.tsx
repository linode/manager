import { Autocomplete, Box } from '@linode/ui';
import React from 'react';

import { ActiveFilterChip } from './ActiveFilterChip';

import type { ModelFilterState } from '../modelLibrary.types';

interface InputModesFilterProps {
  inputModes: string[];
  limitTags?: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  selectedInputModes: string[];
}

export const InputModesFilter = ({
  inputModes,
  limitTags = 1,
  onFilterChange,
  selectedInputModes,
}: InputModesFilterProps) => {
  const options = inputModes.map((m) => ({ label: m, value: m }));
  const selectedOptions = selectedInputModes.map((m) => ({
    label: m,
    value: m,
  }));

  return (
    <Box sx={{ minWidth: 200 }}>
      <Autocomplete
        getOptionDisabled={(option) =>
          selectedInputModes.includes(
            (option as { label: string; value: string }).value
          )
        }
        label="Input Modes"
        limitTags={limitTags}
        multiple
        onChange={(_, value) => {
          const unique = Array.from(
            new Map(
              (value as { label: string; value: string }[]).map((o) => [
                o.value,
                o,
              ])
            ).values()
          );
          onFilterChange({ inputModes: unique.map((o) => o.value) });
        }}
        options={options}
        placeholder={
          selectedOptions.length === 0 ? 'All input modes' : undefined
        }
        renderTags={(tagValue, getTagProps) => {
          const displayed = tagValue.slice(0, limitTags);
          const hiddenCount = tagValue.length - limitTags;
          return (
            <>
              {displayed.map((option, index) => {
                const { key, onDelete } = getTagProps({ index });
                return (
                  <ActiveFilterChip
                    key={key}
                    label={(option as { label: string }).label}
                    onDelete={() => onDelete({} as React.SyntheticEvent)}
                    type="inputModes"
                  />
                );
              })}
              {hiddenCount > 0 && (
                <span style={{ fontSize: 13, marginLeft: 4 }}>
                  {`+${hiddenCount}`}
                </span>
              )}
            </>
          );
        }}
        value={selectedOptions}
      />
    </Box>
  );
};
