import { mount } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import { App } from './App';

it('renders without crashing', () => {
  mount(
    <StaticRouter location="/" context={{}}>
      <App
        classes={{ appFrame: '', content: '' }}
        request={jest.fn()}
        response={jest.fn()}
      />
    </StaticRouter>,
  );
});
