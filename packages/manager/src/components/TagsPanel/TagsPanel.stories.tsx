import { baseRequest } from '@linode/api-v4/lib/request';
import * as React from 'react';

import MockAdapter from 'axios-mock-adapter';

import Snackbar from 'src/components/SnackBar';
import TagsPanel from './TagsPanel';

interface Props {
  tags: string[];
}

interface State {
  tags: string[];
}

class TagsPanelDemo extends React.Component<Props, {}> {
  state: State = {
    tags: [],
  };

  updateTags = (tags: string[]) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.setState({
          tags,
        });
        resolve();
      }, 500);
    });
  };

  componentDidMount() {
    const { tags } = this.props;
    this.setState({
      tags,
    });
  }

  render() {
    const { tags } = this.state;

    return (
      <Snackbar maxSnack={3}>
        <TagsPanel tags={tags} updateTags={this.updateTags} />
      </Snackbar>
    );
  }
}

export default {
  title: 'Tags Panel',

  decorators: [
    (story: any) => {
      const mock = new MockAdapter(baseRequest);

      mock.onGet('/tags').reply(200, {
        data: ['tag1', 'tag2', 'tag3', 'tag4'].map((tag) => ({ label: tag })),
      });
      return <div>{story()}</div>;
    },
  ],
};

export const TagsPanelWithTags = () => {
  return (
    <TagsPanelDemo
      tags={['tagOne', 'tagTwo', 'someStrangeLongTagWithNumber123']}
    />
  );
};

TagsPanelWithTags.story = {
  name: 'Tags panel with tags',
};

export const TagsPanelWithoutTags = () => {
  return <TagsPanelDemo tags={[]} />;
};

TagsPanelWithoutTags.story = {
  name: 'Tags panel without tags',
};
