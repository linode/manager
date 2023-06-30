import * as React from 'react';
import EventsLanding from 'src/features/Events/EventsLanding';
import { useParams } from 'react-router-dom';

const LinodeActivity = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  return (
    <EventsLanding
      entityId={id}
      filter={{
        'entity.type': 'linode',
        'entity.id': id,
      }}
      errorMessage="There was an error retrieving activity for this Linode."
      emptyMessage="No recent activity for this Linode."
      data-testid="linode-events-table"
    />
  );
};

export default LinodeActivity;
