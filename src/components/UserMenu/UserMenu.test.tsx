import { mount } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from 'src/store';
import UserMenu from './UserMenu';

it('renders without crashing', () => {
  mount(
    <Provider store={store}>
      <StaticRouter location="/" context={{}}>
        <UserMenu />
      </StaticRouter>
    </Provider>,
  );
});
