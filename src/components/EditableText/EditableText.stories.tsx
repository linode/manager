import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EditableText from './EditableText';

storiesOf('Editable Text', module)
.addDecorator(ThemeDecorator)
.add('Example', () => (
    <div>
        <EditableText />
        <p>Some text underneath</p>
    </div>
));
