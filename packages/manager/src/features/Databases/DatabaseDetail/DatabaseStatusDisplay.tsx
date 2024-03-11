import React from 'react';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';
import { Event } from '@linode/api-v4';
import {
  Database,
  DatabaseInstance,
  DatabaseStatus,
} from '@linode/api-v4/lib/databases/types';
import { Status, StatusIcon } from 'src/components/StatusIcon/StatusIcon';

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  active: 'active',
  degraded: 'inactive',
  failed: 'error',
  provisioning: 'other',
  restoring: 'other',
  resuming: 'other',
  suspended: 'error',
  suspending: 'other',
  resizing: 'other',
};

export const DatabaseStatusDisplay: React.FC<{
  events: Event[] | undefined;
  database: Database | DatabaseInstance;
}> = (props) => {
  // recent event
  const recentEvent = props.events?.find(
    (event) =>
      event.entity?.id === props.database.id && event.entity.type === 'database'
  );

  // progress
  let progress: number | undefined;
  if (recentEvent?.action === 'database_resize') {
    progress = recentEvent?.percent_complete ?? 0;
  }

  // status
  let displayedStatus;
  if (
    recentEvent?.status === 'started' ||
    recentEvent?.status === 'scheduled'
  ) {
    displayedStatus = (
      <>
        <StatusIcon status={databaseStatusMap[recentEvent?.status]} />
        <Typography variant="body1" sx={{ display: 'inline-block' }}>
          {`Resizing ${progress ? `(${progress}%)` : '(0%)'}`}
        </Typography>
      </>
    );
  } else {
    displayedStatus = (
      <>
        <StatusIcon status={databaseStatusMap[props.database.status]} />
        {capitalize(props.database.status)}
      </>
    );
  }

  return displayedStatus;
};
