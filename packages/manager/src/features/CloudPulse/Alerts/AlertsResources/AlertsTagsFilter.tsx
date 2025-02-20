import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { AlertAdditionalFilterKey } from './types';

export interface AlertsTagFilterProps {
  /**
   * Callback to publish the selected tags
   */
  handleFilterChange: (
    tags: string[] | undefined,
    type: AlertAdditionalFilterKey
  ) => void;

  /**
   * The unique set of tags that needs to be displayed
   */
  tagOptions: string[];
}

interface AlertTags {
  /**
   * The label of the alert tag option
   */
  label: string;
}

export const AlertsTagFilter = React.memo((props: AlertsTagFilterProps) => {
  const { handleFilterChange: handleSelection, tagOptions } = props;
  const [selectedTags, setSelectedTags] = React.useState<AlertTags[]>([]);

  const builtTagOptions: AlertTags[] = tagOptions.map((option) => ({
    label: option,
  }));

  const handleFilterSelection = React.useCallback(
    (_e: React.ChangeEvent<{}>, tags: AlertTags[]) => {
      setSelectedTags(tags);
      handleSelection(
        tags.length ? tags.map(({ label }) => label) : undefined,
        'tags'
      );
    },
    [handleSelection]
  );

  return (
    <Autocomplete
      textFieldProps={{
        InputProps: {
          sx: {
            '::-webkit-scrollbar': {
              display: 'none',
            },
            maxHeight: '55px',
            msOverflowStyle: 'none',
            overflow: 'auto',
            scrollbarWidth: 'none',
          },
        },
        hideLabel: true,
      }}
      autoHighlight
      clearOnBlur
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label="Tags"
      limitTags={1}
      multiple
      onChange={handleFilterSelection}
      options={builtTagOptions}
      placeholder={selectedTags.length ? '' : 'Select Tags'}
      value={selectedTags}
    />
  );
});
