import { storiesOf } from '@storybook/react';
import * as React from 'react';
import PasswordInput from './PasswordInput';

storiesOf('Password Input', module).add('Example', () => (
  <div>
    <PasswordInput />
    <p>Some text underneath</p>
  </div>
));
