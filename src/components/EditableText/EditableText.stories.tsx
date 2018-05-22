import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { checkA11y } from '@storybook/addon-a11y';

import ThemeDecorator from '../../utilities/storybookDecorators';

import EditableText from './EditableText';

storiesOf('Editable Text', module)
.addDecorator(ThemeDecorator)
.addDecorator(checkA11y)
.add('Headline & Title', () => (
  <div>
    <EditableText
        variant="headline"
        text="Edit me!"
        onEdit={action('edit-text')}
    />
    <br /><br />
    <EditableText
        variant="title"
        text="Edit me!"
        onEdit={action('edit-text')}
    />
  </div>
));
