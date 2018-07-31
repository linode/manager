import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from 'src/utilities/storybookDecorators';

import SkeletonScreen from './SkeletonScreen';

storiesOf('Skeleton Screen', module)
  .addDecorator(ThemeDecorator)
  .add('default', () => (
    <SkeletonScreen type="table" />
));
