import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import store from 'src/store';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

it('renders without crashing', () => {
  const component = shallow(
    <LinodeThemeWrapper>
      <Provider store={store}>
        <StaticRouter location="/" context={{}}>
          <App
            onPresentSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
            location={{
              pathname: '',
              hash: '',
              search: '',
              state: {},
            }}
            classes={{
              appFrame: '',
              content: '',
              wrapper: '',
              grid: '',
              switchWrapper: '',
            }}
            userId={123456}
            profileLoading={false}
            actions={{
              requestVolumes: jest.fn(),
              requestNodeBalancers: jest.fn(),
              requestDomains: jest.fn(),
              requestImages: jest.fn(),
              requestLinodes: jest.fn(),
              requestNotifications: jest.fn(),
              requestProfile: jest.fn(),
              requestSettings: jest.fn(),
              requestTypes: jest.fn(),
            }}
            documentation={[]}
            toggleTheme={jest.fn()}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>,
  );
  expect(component.find('App')).toHaveLength(1);
});
