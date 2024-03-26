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
interface Props {
  events: Event[] | undefined;
  database: Database | DatabaseInstance;
}
export const DatabaseStatusDisplay = (props: Props) => {
  const { events, database } = props;
  const recentEvent = events?.find(
    (event: Event) =>
      event.entity?.id === database.id && event.entity?.type === 'database'
  );

  let progress: number | undefined;
  if (recentEvent?.action === 'database_resize') {
    progress = recentEvent?.percent_complete ?? 0;
  }

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
        <StatusIcon status={databaseStatusMap[database.status]} />
        {capitalize(database.status)}
      </>
    );
  }

  return displayedStatus;
};
