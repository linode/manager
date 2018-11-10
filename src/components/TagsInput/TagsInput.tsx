import * as React from 'react';

import { concat, lensPath, pathOr, set } from 'ramda';

import Select, { Item, NoOptionsMessageProps } from 'src/components/EnhancedSelect/Select';

import { getTags, Tag } from 'src/services/tags';
import composeState from 'src/utilities/composeState';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';


export interface TagActionsObject {
  createTag: (inputValue:string) => void;
}

export interface ActionMeta {
  action: string;
}

export interface TagObject {
  actions: TagActionsObject;
  errors?: Linode.ApiFieldError[];
  selectedTags: Item[];
  newTags: Item[];
}

export interface Props {
  tagError?: string;
  value: Item[];
  onChange: (selected: Item | Item[], actionMeta: ActionMeta) => void;
}

const L = {
  selectedTags: lensPath(['tagObject', 'selectedTags']),
  newTags: lensPath(['tagObject','newTags']),
  errors: lensPath(['tagObject', 'errors']),
};


class TagsInput extends React.Component<Props> {
  composeState = composeState;

  createTag = (inputValue:string) => {
    const { newTags, selectedTags } = this.state.tagObject;
    this.setState(set(L.errors, undefined));
    if (inputValue.length < 3 || inputValue.length > 25) {
      this.setState(set(L.errors, 
        [{'field': 'label', 'reason': 'Length must be 3-25 characters'}]
      ));
      return;
    }
    const newTag: Item = this.tagToItem(inputValue);
    const tags = concat(newTags, [newTag]);
    const linodeTags = concat(selectedTags, [newTag]);
    this.composeState([
      set(L.newTags, tags),
      set(L.selectedTags, linodeTags)
    ])
  }

  tagToItem = (tag:string) => {
    return { value: tag, label: tag }
  }

  state = {
    accountTags: [],
      tagObject: {
      selectedTags: [],
      newTags: [],
      errors: [],
      actions: {
        createTag: this.createTag,
      }
    }
  }

  componentDidMount() {
    getTags()
      .then((response) => {
        const accountTags: Item[] = response.data.map((tag:Tag) => { 
          return { label: tag.label, value: tag.label }
        });
        this.setState({ accountTags });
      })
      .catch((errors) => {
        const defaultError = [{ reason: 'There was an error retrieving your tags.' }];
        this.setState(set(L.errors, pathOr(defaultError, ['response', 'data', 'errors'], errors)));
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
    if (!this.state.tagObject) { return null; }
    const { accountTags } = this.state;
    const { actions, errors } = this.state.tagObject;
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
        createNew={actions.createTag}
        noOptionsMessage={this.getEmptyMessage}
      />
    )
  }
}
export default TagsInput;
