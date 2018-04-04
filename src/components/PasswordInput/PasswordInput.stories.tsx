import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import PasswordInput from './PasswordInput';

storiesOf('Password Input', module)
.addDecorator(ThemeDecorator)
.add('Example', () => (
    <div>
        <PasswordInput/>
        <p>Some text underneath</p>
    </div>
));
