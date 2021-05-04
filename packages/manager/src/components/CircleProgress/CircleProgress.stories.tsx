import * as React from 'react';
import CircleProgress from './CircleProgress';

export default {
  title: 'Circle Progress Indicator',
};

export const Indefinite = () => <CircleProgress noTopMargin />;
export const Mini = () => <CircleProgress mini />;

export const DataInside = () => (
  <CircleProgress noTopMargin green variant="static" value={50}>
    <span data-qa-progress-label>Some data</span>
  </CircleProgress>
);

DataInside.story = {
  name: 'Data inside',
};
