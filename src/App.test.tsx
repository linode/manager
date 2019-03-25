import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from 'src/store';
import { mockNodeBalancerActions } from './__data__/nodeBalancerActions';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

import { hasOauthError } from './App';

it('renders without crashing', () => {
  const component = shallow(
    <LinodeThemeWrapper>
      <Provider store={store}>
        <StaticRouter location="/" context={{}}>
          <App
            {...mockNodeBalancerActions}
            onPresentSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            location={{
              pathname: '',
              hash: '',
              search: '',
              state: {}
            }}
            classes={{
              appFrame: '',
              content: '',
              wrapper: '',
              grid: '',
              switchWrapper: ''
            }}
            userId={123456}
            profileLoading={false}
            actions={{
              requestDomains: jest.fn(),
              requestImages: jest.fn(),
              requestLinodes: jest.fn(),
              requestNotifications: jest.fn(),
              requestProfile: jest.fn(),
              requestSettings: jest.fn(),
              requestTypes: jest.fn(),
              requestRegions: jest.fn(),
              requestVolumes: jest.fn(),
              requestBuckets: jest.fn(),
              requestClusters: jest.fn()
            }}
            documentation={[]}
            toggleTheme={jest.fn()}
            toggleSpacing={jest.fn()}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>
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
