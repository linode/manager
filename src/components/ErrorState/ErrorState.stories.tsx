import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ErrorState from './ErrorState';
import ThemeDecorator from '../../utilities/storybookDecorators';

storiesOf('Error Display', module)
  .addDecorator(ThemeDecorator)
  .add('with text', () => (
    <ErrorState errorText="An error has occured." />
  ));
