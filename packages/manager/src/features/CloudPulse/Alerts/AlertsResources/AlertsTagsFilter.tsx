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

export const AlertsTagFilter = React.memo((props: AlertsTagFilterProps) => {
  const { handleFilterChange: handleSelection, tagOptions } = props;

  const builtTagOptions = tagOptions.map((option) => ({
    id: option,
    label: option,
  }));

  return (
    <Autocomplete
      onChange={(_e, tags) =>
        handleSelection(
          tags.length ? tags.map(({ id }) => id) : undefined,
          'tags'
        )
      }
      textFieldProps={{
        hideLabel: true,
      }}
      autoHighlight
      clearOnBlur
      label="Tags"
      multiple
      options={builtTagOptions}
      placeholder="Select Tags"
    />
  );
});
