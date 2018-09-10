import { concat } from 'ramda';
import * as React from 'react';

import { getTags, Tag } from 'src/services/tags';

import { Item } from 'src/components/EnhancedSelect/Select';

export interface TagActionsObject {
  addTag: (selected:Item) => void;
  createTag: (inputValue:string) => void;
}

interface State {
  tagActions: TagActionsObject;
  accountTags: Item[];
  thisLinodeTags: string[];
  newTags: string[];
}

export default (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<{}, State> {
    addTag = (selected:Item) => {
      const { thisLinodeTags } = this.state;
      const tags = concat(thisLinodeTags, [selected.label]);
      this.setState({ thisLinodeTags: tags })
    }

    createTag = (inputValue:string) => {
      const { newTags, thisLinodeTags } = this.state;
      const tags = concat(newTags, [inputValue]);
      const linodeTags = concat(thisLinodeTags, [inputValue]);
      this.setState({ newTags: tags, thisLinodeTags: linodeTags });
    }

    state = {
      accountTags: [],
      thisLinodeTags: [],
      newTags: [],
      tagActions: {
        addTag: this.addTag,
        createTag: this.createTag,
      }
    }

    componentDidMount() {
      getTags()
        .then((response) => {
          const tags: Item[] = response.data.map((tag:Tag) => { 
            return { label: tag.label, value: tag.label }
          });
          this.setState({ accountTags: tags });
        })
        .catch((error) => {
          /* @todo error handling */
          console.error(error);
        })
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
