import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EditableText from './EditableText';

storiesOf('Editable Text', module)
.addDecorator(ThemeDecorator)
.add('Example', () => (
    <EditableText
        text="Edit me!"
        onEdit={action('edit-text')}
    />
));
