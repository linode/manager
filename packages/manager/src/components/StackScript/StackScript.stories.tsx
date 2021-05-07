import * as React from 'react';
import { Provider } from 'react-redux';
import { stackScripts } from 'src/__data__/stackScripts';
import store from 'src/store';

import StackScript from './StackScript';

export default {
  title: 'StackScript',
};

export const StackScriptWithMockData = () => {
  return (
    <Provider store={store}>
      <StackScript data={stackScripts[0]} />
    </Provider>
  );
};

StackScriptWithMockData.story = {
  name: 'StackScript with mock data',
};
