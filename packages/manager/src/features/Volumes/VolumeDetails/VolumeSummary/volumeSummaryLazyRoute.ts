import { createLazyRoute } from '@tanstack/react-router';

import { VolumeSummary } from './VolumeSummary';

export const volumeSummaryLazyRoute = createLazyRoute(
  '/volumes/$volumeId/summary'
)({
  component: VolumeSummary,
});
