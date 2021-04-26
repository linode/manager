import { getTags } from '@linode/api-v4/lib/tags';
import { APIError } from '@linode/api-v4/lib/types';
import { concat } from 'ramda';
import * as React from 'react';
import Select, {
  Item,
  NoOptionsMessageProps,
} from 'src/components/EnhancedSelect/Select';
import useAccountManagement from 'src/hooks/useAccountManagement';
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

const TagsInput: React.FC<Props> = (props) => {
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

  const [accountTags, setAccountTags] = React.useState<Tag[]>([]);
  const [errors, setErrors] = React.useState<APIError[]>([]);

  const { _isRestrictedUser } = useAccountManagement();

  React.useEffect(() => {
    if (!_isRestrictedUser) {
      getTags()
        .then((response) => {
          const accountTags = response.data.map((tag: Tag) => {
            return { label: tag.label, value: tag.label };
          });
          setAccountTags(accountTags);
        })
        .catch((e) => {
          const defaultError = [
            { reason: 'There was an error retrieving your tags.' },
          ];

          setErrors(defaultError);
        });
    }
  }, [_isRestrictedUser]);

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

  const error = disabled ? undefined : labelError || tagError || generalError;

  return (
    <Select
      name={name}
      variant="creatable"
      isMulti={true}
      label={label || 'Add Tags'}
      hideLabel={hideLabel}
      options={accountTags}
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
