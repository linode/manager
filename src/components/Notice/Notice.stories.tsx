import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Notice from './Notice';

storiesOf('Notice', module)
.addDecorator(ThemeDecorator)
.add('All Notices', () => (
  <React.Fragment>
    <Notice error text="This is an error notice" />
    <Notice warning text="This is a warning notice" />
    <Notice success text="This is a success notice" />
  </React.Fragment>
));
