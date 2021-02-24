import { shallow } from 'enzyme';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from 'src/store';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { hasOauthError } from './App';

it('renders without crashing.', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <App
            {...reactRouterProps}
            linodes={[]}
            profileError={undefined}
            username=""
            isLoggedInAsCustomer={false}
            closeSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            location={{
              pathname: '',
              hash: '',
              search: '',
              state: {}
            }}
            userId={123456}
            documentation={[]}
            appIsLoading={false}
            toggleTheme={jest.fn()}
            accountCapabilities={[]}
            accountLoading={false}
            linodesLoading={false}
            accountSettingsLoading={false}
            ldClient={{} as any}
            featureFlagsLoading={false}
            flags={{}}
          />
        </StaticRouter>
      </LinodeThemeWrapper>
    </Provider>
  );
  expect(component.find('App')).toHaveLength(1);
});

const errors: (APIError[] | Error)[] = [
  [
    {
      reason: 'invalid OAuTh token'
    }
  ],
  new Error('hello world'),
  [
    {
      reason: 'Invalid Something else'
    }
  ],
  new Error('hello world again')
];

it('isOAuthError returns true for errors that have oauth errors in them', () => {
  expect(hasOauthError(errors[0], errors[1])).toBeTruthy();
  expect(hasOauthError(errors[2], errors[3])).toBeFalsy();
});
