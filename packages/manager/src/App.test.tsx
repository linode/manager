import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import { App } from './App';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { storeFactory } from './store';

const store = storeFactory();

it('renders without crashing.', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
        <StaticRouter context={{}} location="/">
          <App />
        </StaticRouter>
      </LinodeThemeWrapper>
    </Provider>
  );
  expect(component.find('App')).toHaveLength(1);
});
