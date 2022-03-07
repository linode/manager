import * as React from 'react';
import CopyTooltip from './CopyTooltip';

class Example extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: '3.5em',
        }}
      >
        Hello World
        <CopyTooltip text="Hello World" />
      </div>
    );
  }
}

export default {
  title: 'UI Elements/Tooltip/Copy Tooltip',
};

export const _CopyTooltip = () => <Example />;
