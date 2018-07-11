import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ErrorState from './ErrorState';

storiesOf('Error Display', module)
  .addDecorator(ThemeDecorator)
  .add('with text', () => (
    <ErrorState errorText="An error has occured." />
  ));
