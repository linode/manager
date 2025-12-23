import { Autocomplete } from '@linode/ui';
import React from 'react';

import type { Item } from '../../constants';
import type { ChannelType } from '@linode/api-v4';

export interface NotificationChannelTypeSelectProps {
  /**
   * Whether the channel type select is disabled
   */
  disabled?: boolean;
  /**
   * Error text to display when the field has a validation error
   */
  error?: string;
  /**
   * Function to handle the change of the channel type
   */
  handleChannelTypeChange?: (value: ChannelType | null) => void;
  /**
   * Function to handle the blur event
   */
  onBlur?: () => void;
  /**
   * Options for the channel type select
   */
  options: Item<string, ChannelType>[];
  /**
   * Value of the channel type in the form
   */
  value: ChannelType | null;
}

export const NotificationChannelTypeSelect = React.memo(
  (props: NotificationChannelTypeSelectProps) => {
    const { disabled, error, handleChannelTypeChange, value, options, onBlur } =
      props;

    return (
      <Autocomplete
        data-testid="channel-type-select"
        disableClearable={disabled}
        disabled={disabled}
        errorText={error}
        label="Type"
        onBlur={onBlur}
        onChange={(_, selected, reason) => {
          if (selected && handleChannelTypeChange) {
            handleChannelTypeChange(selected.value);
          }
          if (reason === 'clear' && handleChannelTypeChange) {
            handleChannelTypeChange(null);
          }
        }}
        options={options}
        placeholder="Select a Channel Type"
        value={options.find((option) => option.value === value) ?? null}
      />
    );
  }
);
