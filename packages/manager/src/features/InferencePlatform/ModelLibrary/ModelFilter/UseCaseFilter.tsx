import { Autocomplete, Box } from '@linode/ui';
import React from 'react';

import { ActiveFilterChip } from './ActiveFilterChip';

import type { ModelFilterState } from '../modelLibrary.types';

interface UseCaseFilterProps {
  limitTags?: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  selectedUseCaseTags: string[];
  useCaseTags: string[];
}

export const UseCaseFilter = ({
  limitTags = 1,
  onFilterChange,
  selectedUseCaseTags,
  useCaseTags,
}: UseCaseFilterProps) => {
  const options = useCaseTags.map((t) => ({ label: t, value: t }));
  const selectedOptions = selectedUseCaseTags.map((t) => ({
    label: t,
    value: t,
  }));

  return (
    <Box sx={{ minWidth: 200 }}>
      <Autocomplete
        getOptionDisabled={(option) =>
          selectedUseCaseTags.includes(
            (option as { label: string; value: string }).value
          )
        }
        label="Use Case"
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
          onFilterChange({ useCaseTags: unique.map((o) => o.value) });
        }}
        options={options}
        placeholder={selectedOptions.length === 0 ? 'All use cases' : undefined}
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
                    type="useCaseTags"
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
