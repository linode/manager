import { APIError } from '@linode/api-v4/lib/types';
import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import { App, hasOauthError } from './App';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { queryClientFactory } from './queries/base';
import { storeFactory } from './store';

const store = storeFactory(queryClientFactory());

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

const errors: (APIError[] | Error)[] = [
  [
    {
      reason: 'invalid OAuTh token',
    },
  ],
  new Error('hello world'),
  [
    {
      reason: 'Invalid Something else',
    },
  ],
  new Error('hello world again'),
];

it('isOAuthError returns true for errors that have oauth errors in them', () => {
  expect(hasOauthError(errors[0], errors[1])).toBeTruthy();
  expect(hasOauthError(errors[2], errors[3])).toBeFalsy();
});
