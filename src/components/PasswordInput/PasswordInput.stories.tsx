import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

import ThemeDecorator from '../../utilities/storybookDecorators';

import PasswordInput from './PasswordInput';

storiesOf('Password Input', module)
.addDecorator(ThemeDecorator)
.addDecorator(checkA11y)
.add('Example', () => (
    <div>
        <PasswordInput/>
        <p>Some text underneath</p>
    </div>
));
