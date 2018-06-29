import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../utilities/storybookDecorators';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import { StaticRouter } from 'react-router';

import {images} from 'src/__data__/images';

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
          images={images}
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
