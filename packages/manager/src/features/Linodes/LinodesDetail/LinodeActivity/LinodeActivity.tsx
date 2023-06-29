import { Params } from '@linode/api-v4';
import * as React from 'react';
import EventsLanding from 'src/features/Events/EventsLanding';
import { getEventsForEntity } from 'src/utilities/getEventsForEntity';
import { useParams } from 'react-router-dom';

const LinodeActivity = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  return (
    <EventsLanding
      entityId={id}
      getEventsRequest={(params: Params = {}) =>
        getEventsForEntity(params, 'linode', id)
      }
      errorMessage="There was an error retrieving activity for this Linode."
      emptyMessage="No recent activity for this Linode."
      data-testid="linode-events-table"
    />
  );
};

export default LinodeActivity;
