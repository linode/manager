import { concat, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';
import { createTag as _createTag, getTags, Tag } from 'src/services/tags';
import composeState from 'src/utilities/composeState';

export interface TagActionsObject {
  addTag: (selected:Item[]) => void;
  createTag: (inputValue:string) => void;
  getLinodeTagList: () => string[];
}

export interface TagObject {
  actions: TagActionsObject;
  errors?: Linode.ApiFieldError[];
  accountTags: Item[];
  selectedTags: Item[];
  newTags: Item[];
}

interface State {
  tagObject: TagObject;
}

const L = {
  accountTags: lensPath(['tagObject','accountTags']),
  selectedTags: lensPath(['tagObject', 'selectedTags']),
  newTags: lensPath(['tagObject','newTags']),
  errors: lensPath(['tagObject', 'errors']),
};

export default (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<{}, State> {
    composeState = composeState;

    addTag = (selected:Item[]) => {
      this.composeState([
        set(L.selectedTags, selected),
        set(L.errors, undefined)
      ]);
    }

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

    getLinodeTagList = () : string[] => {
      const { selectedTags } = this.state.tagObject;
      return this.getTagList(selectedTags);
    }

    tagToItem = (tag:string) => {
      return { value: tag, label: tag }
    }

    state = {
      tagObject: {
        accountTags: [],
        selectedTags: [],
        newTags: [],
        errors: [],
        actions: {
          addTag: this.addTag,
          createTag: this.createTag,
          getLinodeTagList: this.getLinodeTagList,
        }
      }
    }

    componentDidMount() {
      getTags()
        .then((response) => {
          const tags: Item[] = response.data.map((tag:Tag) => { 
            return { label: tag.label, value: tag.label }
          });
          this.setState(set(L.accountTags, tags));
        })
        .catch((errors) => {
          const defaultError = [{ reason: 'There was an error retrieving your tags.' }];
          this.setState(set(L.errors, pathOr(defaultError, ['response', 'data', 'errors'], errors)));
        })
    }

    getTagList = (tags:Item[]) : string[] => {
      return tags.map((tag:Item) => tag.label);
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
      });
    }

  }

  return WrappedComponent;
}
