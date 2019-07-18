import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ExternalLink from './';

storiesOf('External Link', module).add('default', () => (
  <div style={{ padding: 20 }}>
    <ExternalLink
      link="http://linode.com"
      text="Here is a link to the Linode website"
    />
  </div>
));
