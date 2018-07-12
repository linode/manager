import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import EditableText from './EditableText';

class InteractiveEditableText extends React.Component {
  mounted: boolean = false;
  state = {
    text: 'Edit me!',
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  omponentDidMount() {
    this.mounted = true;
  }

  editText = (value: string) => {
    this.setState({ text: value });
  }

  cancelEdit = () => {
    this.forceUpdate();
  }

  render() {
    return (
      <React.Fragment>
        <EditableText
          variant="headline"
          text={this.state.text}
          onEdit={this.editText}
          onCancel={this.cancelEdit}
        />
      </React.Fragment>
    )
  }
}

storiesOf('Editable Text', module)
.addDecorator(ThemeDecorator)
.add('Headline & Title', () => (
  <InteractiveEditableText />
));
