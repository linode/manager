import { storiesOf } from '@storybook/react';
import * as React from 'react';
import EditableText from './EditableText';

class InteractiveEditableText extends React.Component {
  mounted: boolean = false;
  state = {
    text: 'Edit me!',
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  omponentDidMount() {
    this.mounted = true;
  }

  editText = (value: string) => {
    this.setState({ text: value });
    return Promise.resolve('hello world');
  };

  cancelEdit = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <EditableText
        text={this.state.text}
        onEdit={this.editText}
        onCancel={this.cancelEdit}
      />
    );
  }
}

storiesOf('Editable Text', module).add('Headline & Title', () => (
  <InteractiveEditableText />
));
