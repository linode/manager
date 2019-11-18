import { storiesOf } from '@storybook/react';
import * as React from 'react';

import { DataSet } from 'src/components/LineGraph';
import LongviewLineGraph from './LongviewLineGraph';

const mockData: DataSet[] = [
  /* 
    KNOWN BUG:

    try switching the order of these objects. The red will overtake the blue.

    As a hacky fix, we're making both colors transparent. This is similar to the
    colors on both the Linode and NodeBalancer graphs.
  */
  {
    label: 'Volumes',
    borderColor: 'red',
    backgroundColor: 'rgba(211, 76, 151, 0.68)',
    data: [[1537979728, 100], [1637979728, 200], [1737979728, 500]] as [
      number,
      number
    ][]
  },
  {
    label: 'Linodes',
    borderColor: 'blue',
    backgroundColor: 'rgba(76, 161, 211, 0.68)',
    data: [[1537979728, 1000], [1637979728, 2000], [1737979728, 5000]] as [
      number,
      number
    ][]
  }
];

const Example: React.FC<{}> = () => {
  return (
    <div
      style={{
        padding: '1em',
        width: '100%'
      }}
    >
      <LongviewLineGraph
        title="Hello"
        subtitle="world"
        showToday
        data={mockData}
        timezone="America/New_York"
      />
    </div>
  );
};

storiesOf('Longview Line Graph', module).add('Example', () => <Example />);
