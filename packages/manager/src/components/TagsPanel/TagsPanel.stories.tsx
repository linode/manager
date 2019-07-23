import { storiesOf } from '@storybook/react';
import * as React from 'react';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { API_ROOT } from '../../constants';

import Snackbar from 'src/components/SnackBar';
import TagsPanel from './TagsPanel';

const API_REQUEST = `${API_ROOT}/tags`;

interface Props {
  tags: string[];
}

interface State {
  tags: string[];
}

class TagsPanelDemo extends React.Component<Props, {}> {
  state: State = {
    tags: []
  };

  updateTags = (tags: string[]) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        this.setState({
          tags
        });
        resolve();
      }, 500);
    });
  };

  componentDidMount() {
    const { tags } = this.props;
    this.setState({
      tags
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

storiesOf('Tags Panel', module)
  .addDecorator(story => {
    const mock = new MockAdapter(axios);

    mock.onGet(API_REQUEST).reply(200, {
      data: ['tag1', 'tag2', 'tag3', 'tag4'].map(tag => ({ label: tag }))
    });
    return <div>{story()}</div>;
  })
  .add('Tags panel with tags', () => {
    return (
      <TagsPanelDemo
        tags={['tagOne', 'tagTwo', 'someStrangeLongTagWithNumber123']}
      />
    );
  })
  .add('Tags panel without tags', () => {
    return <TagsPanelDemo tags={[]} />;
  });
