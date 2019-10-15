import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Gauge from './GaugePercent';

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
      <Gauge
        height={500}
        width={500}
        value={50}
        max={200}
        innerText="25% Used"
        subTitle="Hello world"
      />
      <Gauge
        height={300}
        width={300}
        value={100}
        max={200}
        subTitle={`This is subtext`}
        filledInColor="green"
      />
      <Gauge
        value={30}
        max={100}
        innerText="25% Used"
        subTitle="Hello world"
        filledInColor="purple"
      />
      <Gauge
        height={150}
        width={150}
        value={50}
        max={200}
        innerText="25%"
        innerTextFontSize={12}
        subTitle={SubText()}
      />
    </React.Fragment>
  );
};

storiesOf('Gauge Percent', module).add('Example', () => <Example />);
