import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Notice from './Notice';

storiesOf('Notice', module).add('All Notices', () => (
  <React.Fragment>
    <div style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
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
        onClose={() => console.log('Dismissed!')} /* tslint:disable-line */
      />
    </div>
  </React.Fragment>
));
