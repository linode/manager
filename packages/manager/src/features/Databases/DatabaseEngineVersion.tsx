import { styled } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import {
  getDatabasesDescription,
  hasPendingUpdates,
  isDefaultDatabase,
  useIsDatabasesEnabled,
} from './utilities';

import type {
  Engine,
  PendingUpdates,
  Platform,
} from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databasePendingUpdates?: PendingUpdates[];
  databasePlatform?: Platform;
  databaseVersion: string;
}

export const DatabaseEngineVersion = (props: Props) => {
  const {
    databaseEngine: engine,
    databaseID,
    databasePendingUpdates,
    databasePlatform: platform,
    databaseVersion: version,
  } = props;
  const engineVersion = getDatabasesDescription({ engine, version });

  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const isDefaultGA = isDatabasesV2GA && isDefaultDatabase({ platform });
  const hasUpdates = hasPendingUpdates(databasePendingUpdates);

  return (
    <>
      {engineVersion}
      {isDefaultGA && hasUpdates && (
        <StyledLink
          data-testid="maintenance-link"
          sx={{ verticalAlign: 'bottom' }}
          to={`/databases/${engine}/${databaseID}/settings`}
        >
          <StatusIcon
            ariaLabel="Maintenance update"
            component="span"
            pulse={false}
            status="other"
          />
        </StyledLink>
      )}
    </>
  );
};

const StyledLink = styled(Link)(({ theme }) => ({
  alignItems: 'center',
  display: 'inline-flex',
  marginLeft: theme.spacing(0.5),
}));
