import { createLazyRoute } from '@tanstack/react-router';

import { LongviewDetailWrapper } from 'src/features/Longview/LongviewDetail/LongviewDetailWrapper';

export const longviewDetailLazyRoute = createLazyRoute('/longview/clients/$id')(
  {
    component: LongviewDetailWrapper,
  }
);
