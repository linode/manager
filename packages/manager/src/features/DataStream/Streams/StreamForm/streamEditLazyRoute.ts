import { createLazyRoute } from '@tanstack/react-router';

import { StreamEdit } from 'src/features/DataStream/Streams/StreamForm/StreamEdit';

export const streamEditLazyRoute = createLazyRoute(
  '/datastream/streams/$streamId/edit'
)({
  component: StreamEdit,
});
