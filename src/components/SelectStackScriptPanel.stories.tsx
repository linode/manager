import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../utilities/storybookDecorators';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import { StaticRouter } from 'react-router';

interface State {
  selectedId?: number;
}

class InteractiveExample extends React.Component<{}, State> {
  state: State = {};

  render() {
    return (
      <StaticRouter>
        <SelectStackScriptPanel
          selectedId={this.state.selectedId}
          onSelect={(id: number) => this.setState({ selectedId: id })}
        />
      </StaticRouter>
    );
  }
}

storiesOf('SelectStackScriptPanel', module)
  .addDecorator(ThemeDecorator)
  .add('Example', () => (<InteractiveExample />));
