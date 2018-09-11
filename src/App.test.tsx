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
            classes={{
              appFrame: '',
              content: '',
              wrapper: '',
              grid: '',
              switchWrapper: '',
            }}
            longLivedLoaded
            userId={123456}
            dispatchRequest={jest.fn()}
            dispatchResponse={jest.fn()}
            documentation={[]}
            toggleTheme={jest.fn()}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>,
  );
  expect(component.find('App')).toHaveLength(1);
});
