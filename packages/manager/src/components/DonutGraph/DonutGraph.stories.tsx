import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Donut from './DonutGraph';

const Example: React.FC<{}> = props => {
  return (
    <Donut
      height={300}
      filledInPercent={30}
    />
  )
}

storiesOf('Donut Graph', module).add('Example', () => <Example />);
