import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router';

import { images } from 'src/__data__/images';
import { stackScripts } from 'src/__data__/stackScripts';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';

import ThemeDecorator from '../utilities/storybookDecorators';

interface State {
  selectedId: number | null;
}

class InteractiveExample extends React.Component<{}, State> {
  state: State = {
    selectedId: null,
  };

  render() {
    return (
      <StaticRouter>
        <SelectStackScriptPanel
          publicImages={images}
          selectedId={this.state.selectedId}
          onSelect={(id: number) => this.setState({ selectedId: id })}
          data={stackScripts}
        />
      </StaticRouter>
    );
  }
}

storiesOf('SelectStackScriptPanel', module)
  .addDecorator(ThemeDecorator)
  .add('Example', () => (<InteractiveExample />));
