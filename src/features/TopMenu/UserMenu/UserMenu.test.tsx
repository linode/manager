import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store from 'src/store';

import UserMenu from './UserMenu';

it('renders without crashing', () => {
  mount(
    <LinodeThemeWrapper>
      <Provider store={store}>
        <StaticRouter location="/" context={{}}>
          <UserMenu />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>,
  );
});
