import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from 'src/store';
import { mockNodeBalancerActions } from './__data__/nodeBalancerActions';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

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
              requestVolumes: jest.fn()
            }}
            documentation={[]}
            toggleTheme={jest.fn()}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>
  );
  expect(component.find('App')).toHaveLength(1);
});
