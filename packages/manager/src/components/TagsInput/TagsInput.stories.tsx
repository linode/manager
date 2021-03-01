import { storiesOf } from '@storybook/react';
import MockAdapter from 'axios-mock-adapter';
import { baseRequest } from '@linode/api-v4/lib/request';
import * as React from 'react';
import { Item } from 'src/components/EnhancedSelect/Select';
import TagsInput from './TagsInput';

interface State {
  tags: Item[];
}

class TagsInputDemo extends React.Component<{}, {}> {
  state: State = {
    tags: [],
  };

  onChange = (tags: Item[]) => {
    this.setState({
      tags,
    });
  };

  render() {
    const { tags } = this.state;

    return <TagsInput value={tags} onChange={this.onChange} />;
  }
}

storiesOf('Tags Input', module)
  .add('Tags Input', () => {
    const mock = new MockAdapter(baseRequest);

    mock.onGet('/tags').reply(200, {
      data: ['tag1', 'tag2', 'tag3', 'tag4'].map((tag) => ({ label: tag })),
    });
    return <TagsInputDemo />;
  })
  .add('Tags Input with an error', () => {
    const mock = new MockAdapter(baseRequest);

    mock.onGet('/tags').reply(500, {});
    return <TagsInputDemo />;
  });
