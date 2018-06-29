import { shallow } from 'enzyme';

import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from 'src/store';
import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';

it('renders without crashing', () => {
  shallow(
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
            request={jest.fn()}
            response={jest.fn()}
            documentation={[]}
            toggleTheme={() => { return; }}
          />
        </StaticRouter>
      </Provider>
    </LinodeThemeWrapper>,
  );
});
