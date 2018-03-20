import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import HideShowText from './HideShowText';

class InteractiveHideShow extends React.Component {
  state = {
    hidden: false,
  };

  handleClick = () => {
    this.setState({ hidden: !this.state.hidden });
  }

  render() {
    return (
      <HideShowText
        onClick={this.handleClick}
        hidden={Boolean(this.state.hidden)}
        text="Hide This Text"
      />
    );
  }
}

storiesOf('HideShowText', module)
.addDecorator(ThemeDecorator)
.add('Interactive', () => (
  <InteractiveHideShow />
))
.add('Shown', () => (
  <HideShowText
    text="Hide This Text"
  />
))
.add('Hidden', () => (
  <HideShowText
    hidden
    text="Hide This Text"
  />
))
;
