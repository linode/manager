import * as React from 'react';
import { storiesOf } from '@storybook/react';

import LinearProgress from './LinearProgress';

storiesOf('Linear Progress Indicator', module)
  .add('Indefinite', () => (
    <LinearProgress />
  ));
