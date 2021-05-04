import * as React from 'react';

import LineGraph from './LineGraph';

const mockData = [
  {
    label: 'Linodes',
    borderColor: 'blue',
    data: [
      [1537979728, 1000],
      [1637979728, 2000],
      [1737979728, 5000],
    ] as [number, number][],
  },
  {
    label: 'Volumes',
    borderColor: 'red',
    data: [
      [1537979728, 100],
      [1637979728, 200],
      [1737979728, 500],
    ] as [number, number][],
  },
];

export default {
  title: 'Line Graph',
};

export const CurrentDay = () => (
  <LineGraph showToday={true} data={mockData} timezone={'America/Los_Angeles'} />
);

export const MultipleDays = () => (
  <LineGraph showToday={false} data={mockData} timezone={'America/Los_Angeles'} />
);

export const FixedMaxYAxis = () => (
  <LineGraph
    showToday={false}
    data={mockData}
    suggestedMax={7000}
    timezone={'America/Los_Angeles'}
  />
);

export const UsingTheChartJsNativeLegendFunctionality = () => (
  <LineGraph nativeLegend showToday={false} data={mockData} timezone={'America/Los_Angeles'} />
);

UsingTheChartJsNativeLegendFunctionality.story = {
  name: 'Using the Chart.js native legend functionality',
};
