import * as React from 'react';
import { useParams } from 'react-router-dom';

import EventsLanding from 'src/features/Events/EventsLanding';

const LinodeActivity = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
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
