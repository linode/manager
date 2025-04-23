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

  if (!id) {
    return null;
  }

  // Leaving this old `match` prop in case it's somehow needed somewhere
  // see https://github.com/linode/manager/pull/11599
  const props = {
    match: {
      params: {
        id,
      },
    },
    params: {
      id,
    },
  };

  return <EnhancedLongviewDetail {...props} />;
};

export const longviewDetailLazyRoute = createLazyRoute('/longview/clients/$id')(
  {
    component: LongviewDetailWrapper,
  }
);
