import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { EventsLanding } from 'src/features/Events/EventsLanding';

const LinodeActivity = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  return (
    <EventsLanding
      data-testid="linode-events-table"
      emptyMessage="No recent activity for this Linode."
      entityId={id}
    />
  );
};

export default LinodeActivity;
