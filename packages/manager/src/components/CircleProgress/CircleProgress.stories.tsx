import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CircleProgress from './CircleProgress';

storiesOf('Circle Progress Indicator', module)
  .add('Indefinite', () => <CircleProgress noTopMargin />)
  .add('Mini', () => <CircleProgress mini />)
  .add('Data inside', () => (
    <CircleProgress noTopMargin green variant="static" value={50}>
      <span data-qa-progress-label>Some data</span>
    </CircleProgress>
  ));
