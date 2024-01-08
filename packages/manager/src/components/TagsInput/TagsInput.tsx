import { APIError } from '@linode/api-v4/lib/types';
import { concat } from 'ramda';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import Select, {
  Item,
  NoOptionsMessageProps,
} from 'src/components/EnhancedSelect/Select';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { getErrorMap } from 'src/utilities/errorUtils';

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
   * Callback fired when the value changes.
   */
  onChange: (selected: Item[]) => void;
  /**
   * An error to display beneath the input.
   */
  tagError?: string;
  /**
   * The value of the input.
   */
  value: Item[];
}

export const TagsInput = (props: TagsInputProps) => {
  const {
    disabled,
    hideLabel,
    label,
    menuPlacement,
    name,
    onChange,
    tagError,
    value,
  } = props;

  const [errors, setErrors] = React.useState<APIError[]>([]);

  const { data: profile } = useProfile();
  const { data: accountTags, error: accountTagsError } = useTagSuggestions(
    !profile?.restricted
  );

  const queryClient = useQueryClient();

  const accountTagItems: Item[] =
    accountTags?.map((tag) => ({
      label: tag.label,
      value: tag.label,
    })) ?? [];

  const createTag = (inputValue: string) => {
    const newTag = { label: inputValue, value: inputValue };
    const updatedSelectedTags = concat(value, [newTag]);

    if (inputValue.length < 3 || inputValue.length > 50) {
      setErrors([
        {
          field: 'label',
          reason: 'Length must be 3-50 characters',
        },
      ]);
    } else {
      setErrors([]);
      onChange(updatedSelectedTags);
      if (accountTags) {
        updateTagsSuggestionsData([...accountTags, newTag], queryClient);
      }
    }
  };

  const getEmptyMessage = (value: NoOptionsMessageProps) => {
    const { value: tags } = props;
    if (tags.map((tag) => tag.value).includes(value.inputValue)) {
      return 'This tag is already selected.';
    } else {
      return 'No results.';
    }
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
    <Select
      creatable
      errorText={error}
      hideLabel={hideLabel}
      isDisabled={disabled}
      isMulti={true}
      label={label || 'Add Tags'}
      menuPlacement={menuPlacement}
      name={name}
      noOptionsMessage={getEmptyMessage}
      onChange={onChange}
      onCreateOption={createTag}
      options={accountTagItems}
      placeholder={'Type to choose or create a tag.'}
      value={value}
    />
  );
};
