import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import store from 'src/store';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

export const mockNodeBalancerActiosn = {
  getAllNodeBalancers: jest.fn(),
  createNodeBalancer: jest.fn(),
  deleteNodeBalancer: jest.fn(),
  updateNodeBalancer: jest.fn(),
  getAllNodeBalancerConfigs: jest.fn(),
  createNodeBalancerConfig: jest.fn(),
  updateNodeBalancerConfig: jest.fn(),
  deleteNodeBalancerConfig: jest.fn(),
  getAllNodeBalancerConfigNodes: jest.fn(),
  createNodeBalancerConfigNode: jest.fn(),
  deleteNodeBalancerConfigNode: jest.fn(),
  updateNodeBalancerConfigNode: jest.fn(),
};

it('renders without crashing', () => {
  const component = shallow(
    <LinodeThemeWrapper>
      <Provider store={store}>
        <StaticRouter location="/" context={{}}>
          <App
            {...mockNodeBalancerActiosn}
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
    </LinodeThemeWrapper>,
  );
  expect(component.find('App')).toHaveLength(1);
});
