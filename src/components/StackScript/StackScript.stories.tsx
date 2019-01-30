import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { stackScripts } from 'src/__data__/stackScripts';
import store from 'src/store';

import StackScript from './StackScript';

storiesOf('StackScript', module).add('StackScript with mock data', () => {
  return (
    <Provider store={store}>
      <StackScript data={stackScripts[0]} />
    </Provider>
  );
});
