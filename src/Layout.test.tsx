import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import store from 'src/store';
import { Layout } from './Layout';
import LinodeThemeWrapper from './LinodeThemeWrapper';

it('renders without crashing', () => {
  const component = shallow(
    <LinodeThemeWrapper>
      <Provider store={store}>
        <StaticRouter location="/" context={{}}>
          <Layout
            onPresentSnackbar={jest.fn()}
            enqueueSnackbar={jest.fn()}
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
              requestDomains: jest.fn(),
              requestImages: jest.fn(),
              requestLinodes: jest.fn(),
              requestNotifications: jest.fn(),
              requestProfile: jest.fn(),
              requestSettings: jest.fn(),
              requestTypes: jest.fn(),
              requestRegions: jest.fn(),
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
