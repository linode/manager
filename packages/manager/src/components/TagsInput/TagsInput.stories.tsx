import { storiesOf } from '@storybook/react';
import * as React from 'react';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { API_ROOT } from '../../constants';

import TagsInput from './TagsInput';

import { Item } from 'src/components/EnhancedSelect/Select';

const API_REQUEST = `${API_ROOT}/tags`;

interface State {
  tags: Item[];
}

class TagsInputDemo extends React.Component<{}, {}> {
  state: State = {
    tags: []
  };

  onChange = (tags: Item[]) => {
    this.setState({
      tags
    });
  };

  render() {
    const { tags } = this.state;

    return <TagsInput value={tags} onChange={this.onChange} />;
  }
}

storiesOf('Tags Input', module)
  .add('Tags Input', () => {
    const mock = new MockAdapter(axios);

    mock.onGet(API_REQUEST).reply(200, {
      data: ['tag1', 'tag2', 'tag3', 'tag4'].map(tag => ({ label: tag }))
    });
    return <TagsInputDemo />;
  })
  .add('Tags Input with an error', () => {
    const mock = new MockAdapter(axios);

    mock.onGet(API_REQUEST).reply(500, {});
    return <TagsInputDemo />;
  });
