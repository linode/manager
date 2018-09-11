import * as Bluebird from 'bluebird';
import { concat, lensPath, set } from 'ramda';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';
import { createTag as _createTag, getTags, Tag } from 'src/services/tags';
import composeState from 'src/utilities/composeState';

export interface TagActionsObject {
  addTag: (selected:Item[]) => void;
  addNewTagsToLinode: (linodeID:number) => void;
  createTag: (inputValue:string) => void;
  getLinodeTagList: () => string[];
}

export interface TagObject {
  actions: TagActionsObject;
  errors: Linode.ApiFieldError[];
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
      this.setState(set(L.selectedTags, selected))
    }

    createTag = (inputValue:string) => {
      const { newTags, selectedTags } = this.state.tagObject;
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

    addNewTagsToLinode = (linodeID:number) => {
      /* When creating a new tag in the database,
      * we have the option of immediately attaching
      * the tag to a Linode. This method should only
      * be called after a new Linode is successfully created.
      */
      const { newTags } = this.state.tagObject;
      const newTagList = this.getTagList(newTags);
      Bluebird.map(newTagList, (tag:string) => {
        _createTag({ label: tag, linodes: [linodeID]});
      }).catch((errors) => {
        this.setState(set(L.errors, errors));
      });
    }

    state = {
      tagObject: {
        accountTags: [],
        selectedTags: [],
        newTags: [],
        errors: [],
        actions: {
          addTag: this.addTag,
          addNewTagsToLinode: this.addNewTagsToLinode,
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
          this.setState(set(L.errors, errors));
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
