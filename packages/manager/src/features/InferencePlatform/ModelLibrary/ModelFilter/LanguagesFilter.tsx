import { Autocomplete, Box } from '@linode/ui';
import React from 'react';

import { ActiveFilterChip } from './ActiveFilterChip';

import type { ModelFilterState } from '../modelLibrary.types';

interface LanguagesFilterProps {
  languages: string[];
  limitTags?: number;
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  selectedLanguages: string[];
}

export const LanguagesFilter = ({
  languages,
  limitTags = 1,
  onFilterChange,
  selectedLanguages,
}: LanguagesFilterProps) => {
  const languageOptions = languages.map((l) => ({ label: l, value: l }));
  const selectedOptions = selectedLanguages.map((l) => ({
    label: l,
    value: l,
  }));

  return (
    <Box sx={{ minWidth: 200 }}>
      <Autocomplete
        getOptionDisabled={(option) =>
          selectedLanguages.includes(
            (option as { label: string; value: string }).value
          )
        }
        label="Languages"
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
          onFilterChange({ languages: unique.map((o) => o.value) });
        }}
        options={languageOptions}
        placeholder={selectedOptions.length === 0 ? 'All languages' : undefined}
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
                    type="language"
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
