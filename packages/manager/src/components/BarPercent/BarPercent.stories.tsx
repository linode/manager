import * as React from 'react';
import BarPercent from './BarPercent';

export default {
  title: 'UI Elements/BarPercent',
};

export const Percentage = () => <BarPercent value={20} max={1503} />;

export const Loading = () => (
  <BarPercent value={20} max={1432} isFetchingValue={true} />
);

export const LoadingWithText = () => (
  <BarPercent
    value={342}
    max={4234}
    isFetchingValue={true}
    loadingText="Loading your stuff"
  />
);

LoadingWithText.story = {
  name: 'Loading with Text',
};
