import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Donut from './DonutGraph';

import Typography from 'src/components/core/Typography';

const SubText = () => {
  return (
    <React.Fragment>
      <Typography>
        <strong>CPU</strong>
      </Typography>
      <Typography>4 Cores</Typography>
    </React.Fragment>
  );
};

const Example: React.FC<{}> = props => {
  return (
    <React.Fragment>
      <Donut
        height={500}
        width={500}
        filledInNumber={50}
        maxNumber={200}
        innerText="25% Used"
        subTitle="Hello world"
      />
      <Donut
        height={300}
        width={300}
        filledInNumber={100}
        maxNumber={200}
        subTitle={`This is subtext`}
      />
      <Donut
        filledInNumber={30}
        maxNumber={100}
        innerText="25% Used"
        subTitle="Hello world"
      />
      <Donut
        height={200}
        width={200}
        filledInNumber={50}
        maxNumber={200}
        innerText="25% Used"
        innerTextFontSize={12}
        subTitle={SubText()}
      />
    </React.Fragment>
  );
};

storiesOf('Donut Graph', module).add('Example', () => <Example />);
