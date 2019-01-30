import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CopyTooltip from './CopyTooltip';

class Example extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: '3.5em'
        }}
      >
        Hello World
        <CopyTooltip text="Hello World" />
      </div>
    );
  }
}

storiesOf('Copy Tooltip', module).add('Copy Tooltip', () => <Example />);
