import { createLazyRoute } from '@tanstack/react-router';

import { EventsLanding } from 'src/features/Events/EventsLanding';

export const eventsLandingLazyRoute = createLazyRoute('/events')({
  component: EventsLanding,
});
