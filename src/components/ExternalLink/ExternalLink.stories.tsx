import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ExternalLink from './';

storiesOf('External Link', module)
  .addDecorator(ThemeDecorator)
  .add('default', () => (
    <div style={{ padding: 20 }}>
      <ExternalLink
        link="http://linode.com"
        text="Here is a link to the Linode website"
      />
    </div>
));
