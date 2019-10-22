import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Skeleton from './Skeleton';

storiesOf('Skeleton', module).add('Table', () => (
  <Skeleton
    variant="rect"
    width="100%"
    height="30px"
    table
    columns={6}
    firstColWidth={40}
  />
));
