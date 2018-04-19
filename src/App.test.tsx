import { mount } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from 'src/store';
import { App } from './App';

it('renders without crashing', () => {
  mount(
    <Provider store={store}>
      <StaticRouter location="/" context={{}}>
        <App
          classes={{ appFrame: '', content: '', wrapper: '' }}
          request={jest.fn()}
          response={jest.fn()}
          longLivedLoaded
        />
      </StaticRouter>
    </Provider>,
  );
});
