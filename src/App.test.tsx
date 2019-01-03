import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';

import store from 'src/store';
import { App } from './App';

const props = {
  onPresentSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  location: {
    pathname: '',
    hash: '',
    search: '',
    state: {},
  },
  classes: {
    appFrame: '',
    content: '',
    wrapper: '',
    grid: '',
    switchWrapper: '',
  },
  userId: 123456,
  profileLoading: false,
  actions: {
    requestDomains: jest.fn(),
    requestImages: jest.fn(),
    requestLinodes: jest.fn(),
    requestNotifications: jest.fn(),
    requestProfile: jest.fn(),
    requestSettings: jest.fn(),
    requestTypes: jest.fn(),
    requestVolumes: jest.fn(),
  },
  documentation: [],
  toggleTheme: jest.fn()
}

describe("App", () => {
  const component = shallow(
    <Provider store={store}>
      <App {...props} />
    </Provider>,
  );
  it('renders without crashing', () => {
    expect(component.find('App')).toHaveLength(1);
  });
});

