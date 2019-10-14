import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Donut from './DonutGraph';

const Example: React.FC<{}> = props => {
  return (
    <React.Fragment>
      <Donut
        height={500}
        width={500}
        filledInNumber={50}
        maxNumber={200}
        innerText="25% Used"
      />
      <Donut
        height={300}
        width={300}
        filledInNumber={100}
        maxNumber={200}
        innerText="Hello world"
      />
      <Donut
        height={200}
        width={200}
        filledInNumber={50}
        maxNumber={200}
        innerText="25% Used"
        innerTextFontSize={12}
      />
    </React.Fragment>
  )
}


storiesOf('Donut Graph', module)
  .add('Example', () => <Example />)
