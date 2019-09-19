import { shallow } from 'enzyme';
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
            notifications={[]}
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
            addNotificationsToLinodes={jest.fn()}
            documentation={[]}
            markAppAsDoneLoading={jest.fn()}
            appIsLoading={false}
            toggleTheme={jest.fn()}
            toggleSpacing={jest.fn()}
            accountCapabilities={[]}
            accountLoading={false}
            nodeBalancersLoading={false}
            linodesLoading={false}
            volumesLoading={false}
            domainsLoading={false}
            bucketsLoading={false}
            accountSettingsLoading={false}
          />
        </StaticRouter>
      </LinodeThemeWrapper>
    </Provider>
  );
  expect(component.find('App')).toHaveLength(1);
});

const errors: (Linode.ApiFieldError[] | Error)[] = [
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
