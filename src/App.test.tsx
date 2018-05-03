import { mount } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from 'src/store';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

it('renders without crashing', () => {
  mount(
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
            request={jest.fn()}
            response={jest.fn()}
            longLivedLoaded
            documentation={[]}
            toggleTheme={() => { return; }}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>,
  );
});
