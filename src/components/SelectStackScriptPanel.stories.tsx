import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { StaticRouter } from 'react-router-dom';

import ThemeDecorator from '../utilities/storybookDecorators';
/* tslint:disable-next-line */
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';

interface State {
  selectedId?: number;
}

class InteractiveExample extends React.Component<{}, State> {
  state: State = {};

  onSelect = (selectedId: number) => this.setState({ selectedId });

  render() {
    const { selectedId } = this.state;

    return (
      <StaticRouter>
        <div style={{ width: '1100px' }}>
          <SelectStackScriptPanel
            selectedId={selectedId}
            onSelect={this.onSelect}
          />
        </div>
      </StaticRouter>
    );
  }
}


storiesOf('SelectStackScriptPanel', module)
  .addDecorator(ThemeDecorator)
  .add('Normal', () => (
    <InteractiveExample />
  ));
