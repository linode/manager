import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

import type { Event } from '@linode/api-v4';
import type {
  Database,
  DatabaseInstance,
  DatabaseStatus,
} from '@linode/api-v4/lib/databases/types';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  active: 'active',
  degraded: 'inactive',
  failed: 'error',
  provisioning: 'other',
  resizing: 'other',
  restoring: 'other',
  resuming: 'other',
  suspended: 'error',
  suspending: 'other',
};
interface Props {
  database: Database | DatabaseInstance;
  events: Event[] | undefined;
}
export const DatabaseStatusDisplay = (props: Props) => {
  const { database, events } = props;
  const recentEvent = events?.find(
    (event: Event) =>
      event.entity?.id === database.id && event.entity?.type === 'database'
  );

  let progress: number | undefined;
  let displayedStatus;

  const isResizing =
    recentEvent?.action === 'database_resize' &&
    database.status === 'resizing' &&
    (recentEvent?.status === 'started' || recentEvent?.status === 'scheduled');

  if (isResizing) {
    progress = recentEvent?.percent_complete ?? 0;
    displayedStatus = (
      <>
        <StatusIcon status="other" />
        <Typography sx={{ display: 'inline-block' }} variant="body1">
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
