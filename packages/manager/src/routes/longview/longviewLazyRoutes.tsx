import { createLazyRoute, useParams } from '@tanstack/react-router';
import * as React from 'react';

import EnhancedLongviewDetail from 'src/features/Longview/LongviewDetail/LongviewDetail';
import LongviewLanding from 'src/features/Longview/LongviewLanding/LongviewLanding';

export const longviewLandingLazyRoute = createLazyRoute('/longview')({
  component: LongviewLanding,
});

// Making a functional component to wrap the EnhancedLongviewDetail HOC
// Ideally we would refactor this and fetch the data properly but considering Longview is nearing its end of life
// we'll just match the legacy routing behavior
const LongviewDetailWrapper = () => {
  const { id } = useParams({ from: '/longview/clients/$id' });
  const matchProps = {
    match: {
      params: {
        id,
      },
    },
  };

  return <EnhancedLongviewDetail {...matchProps} />;
};

export const longviewDetailLazyRoute = createLazyRoute('/longview/clients/$id')(
  {
    component: LongviewDetailWrapper,
  }
);
