import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Skeleton from './Skeleton';

storiesOf('Skeleton', module).add('default', () => (
  <Skeleton variant="rect" width="100%" height="30px" columns={4} />
));
