import { storiesOf } from '@storybook/react';
import * as React from 'react';
import BarPercent from './BarPercent';

storiesOf('BarPercent', module)
  .add('Percentage', () => <BarPercent value={20} max={1503} />)
  .add('Loading', () => (
    <BarPercent value={20} max={1432} isFetchingValue={true} />
  ))
  .add('Loading with Text', () => (
    <BarPercent
      value={342}
      max={4234}
      isFetchingValue={true}
      loadingText="Loading your stuff"
    />
  ));
