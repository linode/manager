import { getTags } from 'linode-js-sdk/lib/tags';
import { APIError } from 'linode-js-sdk/lib/types';
import { concat } from 'ramda';
import * as React from 'react';
import Select, {
  Item,
  NoOptionsMessageProps
} from 'src/components/EnhancedSelect/Select';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

export interface Tag {
  value: string;
  label: string;
}

export interface State {
  accountTags: Item[];
  errors: APIError[];
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

class TagsInput extends React.Component<Props, State> {
  static defaultProps = {
    label: 'Add Tags',
    name: 'tags'
  };
  createTag = (inputValue: string) => {
    const { value, onChange } = this.props;
    const newTag = { value: inputValue, label: inputValue };
    const updatedSelectedTags = concat(value, [newTag]);

    if (inputValue.length < 3 || inputValue.length > 50) {
      this.setState({
        errors: [{ field: 'label', reason: 'Length must be 3-50 characters' }]
      });
    } else {
      this.setState({
        errors: []
      });
      onChange(updatedSelectedTags);
    }
  };

  state: State = {
    accountTags: [],
    errors: []
  };

  componentDidMount() {
    getTags()
      .then(response => {
        const accountTags: Item[] = response.data.map((tag: Tag) => {
          return { label: tag.label, value: tag.label };
        });
        this.setState({ accountTags });
      })
      .catch(_ => {
        const defaultError = [
          { reason: 'There was an error retrieving your tags.' }
        ];
        this.setState({ errors: defaultError });
      });
  }

  getEmptyMessage = (value: NoOptionsMessageProps) => {
    const { value: tags } = this.props;
    if (tags.map(tag => tag.value).includes(value.inputValue)) {
      return 'This tag is already selected.';
    } else {
      return 'No results.';
    }
  };

  render() {
    const {
      tagError,
      onChange,
      value,
      name,
      label,
      hideLabel,
      disabled,
      menuPlacement
    } = this.props;
    const { accountTags, errors } = this.state;

    const hasErrorFor = getAPIErrorFor({ label: 'label' }, errors);
    const labelError = hasErrorFor('label');
    const generalError = hasErrorFor('none');

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
        createNew={this.createTag}
        noOptionsMessage={this.getEmptyMessage}
        disabled={disabled}
        menuPlacement={menuPlacement}
      />
    );
  }
}
export default TagsInput;
