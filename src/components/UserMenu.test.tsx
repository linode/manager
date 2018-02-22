import { mount } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import UserMenu from './UserMenu';

it('renders without crashing', () => {
  mount(
    <StaticRouter location="/" context={{}}>
      <UserMenu />
    </StaticRouter>,
  );
});
