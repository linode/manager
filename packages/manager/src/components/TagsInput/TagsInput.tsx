import {
  updateTagsSuggestionsData,
  useAllTagsQuery,
  useProfile,
} from '@linode/queries';
import { Autocomplete, Chip } from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { concat } from 'ramda';
import * as React from 'react';

import { getErrorMap } from 'src/utilities/errorUtils';

import type { APIError } from '@linode/api-v4/lib/types';

export interface Tag {
  label: string;
  value: string;
}

export interface TagsInputProps {
  /**
   * If true, the component is disabled.
   *
   * @default false
   */
  disabled?: boolean;
  /**
   * If true, the label is hidden, yet still accessible to screen readers.
   */
  hideLabel?: boolean;
  /**
   * The label for the input.
   */
  label?: string;
  /**
   * The placement of the menu, relative to the select input.
   */
  menuPlacement?: 'auto' | 'bottom' | 'top';
  /**
   * The name of the input.
   */
  name?: string;
  /**
   * Removes the default top margin
   */
  noMarginTop?: boolean;
  /**
   * Callback fired when the value changes.
   */
  onChange: (selected: Tag[]) => void;
  /**
   * An error to display beneath the input.
   */
  tagError?: string;
  /**
   * The value of the input.
   */
  value: Tag[];
}

export const TagsInput = (props: TagsInputProps) => {
  const {
    disabled,
    hideLabel,
    label,
    noMarginTop,
    onChange,
    tagError,
    value,
  } = props;

  const [errors, setErrors] = React.useState<APIError[]>([]);

  const { data: profile } = useProfile();
  const { data: accountTags, error: accountTagsError } = useAllTagsQuery(
    !profile?.restricted
  );

  const queryClient = useQueryClient();

  const accountTagItems: Tag[] =
    accountTags?.map((tag) => ({
      label: tag.label,
      value: tag.label,
    })) ?? [];

  const createTag = (inputValue: string) => {
    const newTag = { label: inputValue, value: inputValue };
    const updatedSelectedTags = concat(value, [newTag]);

    const errors = [];

    if (inputValue.trim() === '') {
      errors.push({
        field: 'label',
        reason: 'Tag cannot be an empty',
      });
    }

    if (inputValue.length < 1 || inputValue.length > 50) {
      errors.push({
        field: 'label',
        reason: 'Length must be 1-50 characters',
      });
    }

    if (errors.length > 0) {
      setErrors(errors);
    } else {
      setErrors([]);
      onChange(updatedSelectedTags);
      if (accountTags) {
        updateTagsSuggestionsData([...accountTags, newTag], queryClient);
      }
    }
  };

  const handleRemoveOption = (tagToRemove: Tag) => {
    onChange(value.filter((t) => t.value !== tagToRemove.value));
  };

  const filterOptions = (
    options: Tag[],
    { inputValue }: { inputValue: string }
  ) => {
    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const isExistingTag = options.some(
      (o) => o.label.toLowerCase() === inputValue.toLowerCase()
    );

    if (inputValue !== '' && !isExistingTag) {
      filtered.push({
        label: `Create "${inputValue}"`,
        value: inputValue,
      });
    }

    return filtered;
  };

  const errorMap = getErrorMap(['label'], errors);
  const labelError = errorMap.label;
  const generalError = errorMap.none;

  const error = disabled
    ? undefined
    : labelError ||
      tagError ||
      generalError ||
      (accountTagsError !== null
        ? 'There was an error retrieving your tags.'
        : undefined);

  return (
    <Autocomplete
      onChange={(_, newValue, reason, details) => {
        const detailsOption = details?.option;
        if (
          reason === 'selectOption' &&
          detailsOption?.label.includes(`Create "${detailsOption?.value}"`)
        ) {
          createTag(detailsOption.value);
        } else {
          setErrors([]);
          onChange(newValue);
        }
      }}
      renderTags={(tagValue, getTagProps) => {
        return tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            deleteIcon={<CloseIcon />}
            key={index}
            label={option.label}
            onDelete={() => handleRemoveOption(option)}
          />
        ));
      }}
      autoHighlight
      clearOnBlur
      disableCloseOnSelect={false}
      disabled={disabled}
      errorText={error}
      filterOptions={filterOptions}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      label={label || 'Add Tags'}
      multiple
      noOptionsText={'No results.'}
      options={accountTagItems}
      placeholder={value.length === 0 ? 'Type to choose or create a tag.' : ''}
      textFieldProps={{ hideLabel, noMarginTop }}
      value={value}
    />
  );
};
