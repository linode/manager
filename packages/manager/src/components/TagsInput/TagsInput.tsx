import { APIError } from '@linode/api-v4/lib/types';
import { concat } from 'ramda';
import * as React from 'react';
import Select, {
  Item,
  NoOptionsMessageProps,
} from 'src/components/EnhancedSelect/Select';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { getErrorMap } from 'src/utilities/errorUtils';

export interface Tag {
  value: string;
  label: string;
}

export interface Props {
  label?: string;
  hideLabel?: boolean;
  name?: string;
  tagError?: string;
  value: Item[];
  onChange: (selected: Item[]) => void;
  disabled?: boolean;
  menuPlacement?: 'bottom' | 'top' | 'auto' | undefined;
}

const TagsInput = (props: Props) => {
  const {
    label,
    hideLabel,
    name,
    tagError,
    value,
    onChange,
    disabled,
    menuPlacement,
  } = props;

  const [errors, setErrors] = React.useState<APIError[]>([]);

  const { data: profile } = useProfile();
  const { data: accountTags, error: accountTagsError } = useTagSuggestions(
    !profile?.restricted
  );

  const accountTagItems: Item[] =
    accountTags?.map((tag) => ({
      label: tag.label,
      value: tag.label,
    })) ?? [];

  const createTag = (inputValue: string) => {
    const newTag = { value: inputValue, label: inputValue };
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
        updateTagsSuggestionsData([...accountTags, newTag]);
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
      name={name}
      creatable
      isMulti={true}
      label={label || 'Add Tags'}
      hideLabel={hideLabel}
      options={accountTagItems}
      placeholder={'Type to choose or create a tag.'}
      errorText={error}
      value={value}
      onChange={onChange}
      createNew={createTag}
      noOptionsMessage={getEmptyMessage}
      disabled={disabled}
      menuPlacement={menuPlacement}
    />
  );
};

export default TagsInput;
