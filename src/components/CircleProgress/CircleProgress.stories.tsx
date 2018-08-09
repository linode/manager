import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';

import CircleProgress from './CircleProgress';

storiesOf('Circle Progress Indicator', module)
  .addDecorator(ThemeDecorator)
  .add('Indefinite', () => (
    <CircleProgress noTopMargin />
  ))
  .add('Data inside', () => (
    <CircleProgress noTopMargin green variant="static" value={50}>
      <span>Some data</span>
    </CircleProgress>
  ));
