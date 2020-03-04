import { storiesOf } from '@storybook/react';
import * as React from 'react';
const PasswordInput = React.lazy(() => import('src/components/PasswordInput'));

storiesOf('Password Input', module).add('Example', () => (
  <div>
    <PasswordInput label="Password" />
    <p>Some text underneath</p>
  </div>
));
