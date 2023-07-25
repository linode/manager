import { Params } from '@linode/api-v4';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import EventsLanding from 'src/features/Events/EventsLanding';
import { getEventsForEntity } from 'src/utilities/getEventsForEntity';

const LinodeActivity = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  return (
    <EventsLanding
      getEventsRequest={(params: Params = {}) =>
        getEventsForEntity(params, 'linode', id)
      }
      data-testid="linode-events-table"
      emptyMessage="No recent activity for this Linode."
      entityId={id}
      errorMessage="There was an error retrieving activity for this Linode."
    />
  );
};

export default LinodeActivity;
