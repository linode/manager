import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import store from 'src/store';
import Notice from './Notice';

storiesOf('Notice', module).add('All Notices', () => (
  <React.Fragment>
    <Provider store={store}>
      <div style={{ padding: 8, backgroundColor: '#f4f4f4' }}>
        <Notice error text="This is an error notice" />
        <Notice warning text="This is a warning notice" />
        <Notice success text="This is a success notice" />
        <Notice error important text="This is an important error notice" />
        <Notice warning important text="This is an important warning notice" />
        <Notice success important text="This is an important success notice" />
        <Notice
          warning
          text="This is a dismissible Notice"
          dismissible
          onClose={() => null}
        />
      </div>
    </Provider>
  </React.Fragment>
));
