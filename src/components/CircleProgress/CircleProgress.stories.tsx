import { storiesOf } from '@storybook/react';
import * as React from 'react';

import CircleProgress from './CircleProgress';

storiesOf('Circle Progress Indicator', module)
  .add('Indefinite', () => (
    <CircleProgress noTopMargin />
  ));
