import { storiesOf } from '@storybook/react';
import * as React from 'react';
import SkeletonScreen from './SkeletonScreen';

storiesOf('Skeleton Screen', module).add('default', () => (
  <SkeletonScreen type="table" />
));
