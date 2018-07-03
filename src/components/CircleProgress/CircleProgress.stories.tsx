import * as React from 'react';
import { storiesOf } from '@storybook/react';

import CircleProgress from './CircleProgress';

storiesOf('Circle Progress Indicator', module)
  .add('Indefinite', () => (
    <CircleProgress noTopMargin />
  ));
