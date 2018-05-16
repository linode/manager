import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { checkA11y } from '@storybook/addon-a11y';

import ErrorState from './ErrorState';
import ThemeDecorator from '../../utilities/storybookDecorators';

storiesOf('Error Display', module)
  .addDecorator(ThemeDecorator)
  .addDecorator(checkA11y)
  .add('with text', () => (
    <ErrorState errorText="An error has occured." />
  ));
