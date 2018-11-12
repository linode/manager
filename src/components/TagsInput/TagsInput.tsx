import * as React from 'react';

import { concat } from 'ramda';

import Select, { Item, NoOptionsMessageProps } from 'src/components/EnhancedSelect/Select';

import { getTags } from 'src/services/tags';
import composeState from 'src/utilities/composeState';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';


export interface Tag {
  value: string;
  label: string;
}

export interface State {
  accountTags: Item[],
  errors: Linode.ApiFieldError[] | undefined,
}

export interface Props {
  tagError?: string;
  value: Item[];
  onChange: (selected: Item[]) => void;
}

class TagsInput extends React.Component<Props, State> {
  composeState = composeState;

  createTag = (inputValue:string) => {
    const { accountTags } = this.state;
    const { value, onChange } = this.props;
    this.setState({ errors: undefined });
    if (inputValue.length < 3 || inputValue.length > 25) {
      this.setState({errors: [{'field': 'label', 'reason': 'Length must be 3-25 characters'}] });
      return;
    }
    const newTag: Item = this.tagToItem(inputValue);
    const updatedTags = concat(accountTags, [newTag]);
    const updatedSelectedTags = concat(value, [newTag]);
    this.setState({
      accountTags: updatedTags,
    });
    onChange(updatedSelectedTags);
  }

  tagToItem = (tag:string) => {
    return { value: tag, label: tag }
  }

  state: State = {
    accountTags: [],
    errors: [],
  }

  componentDidMount() {
    getTags()
      .then((response) => {
        const accountTags: Item[] = response.data.map((tag: Tag) => {
          return { label: tag.label, value: tag.label }
        });
        this.setState({ accountTags });
      })
      .catch((errors) => {
        const defaultError = [{ reason: 'There was an error retrieving your tags.' }];
        this.setState({errors: defaultError});
      })
  }

  getTagList = (tags:Item[]) : string[] => {
    return tags.map((tag:Item) => tag.label);
  }


  getEmptyMessage = (value:NoOptionsMessageProps) => {
    const { value: tags } = this.props;
    if (tags.map(tag => tag.value).includes(value.inputValue)) { return 'This tag is already selected.'}
    else { return "No results." }
  }

  render() {
    const { accountTags, errors } = this.state;
    const hasErrorFor = getAPIErrorFor({ label: 'label' }, errors);
    // Label refers to the tag label, not the Linode label
    const labelError = hasErrorFor('label');
    const generalError = hasErrorFor('none');
    const { tagError, onChange, value } = this.props;
    return (
      <Select
        variant='creatable'
        isMulti={true}
        label={"Add Tags"}
        options={accountTags}
        placeholder={"Type to choose or create a tag."}
        errorText={labelError || tagError || generalError}
        value={value}
        onChange={onChange}
        createNew={this.createTag}
        noOptionsMessage={this.getEmptyMessage}
      />
    )
  }
}
export default TagsInput;
