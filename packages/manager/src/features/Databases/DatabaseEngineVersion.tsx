import { styled } from '@mui/material';
import React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';

import { getDatabasesDescription, hasPendingUpdates } from './utilities';

import type { Engine, PendingUpdates } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databasePendingUpdates?: PendingUpdates[];
  databaseVersion: string;
}

export const DatabaseEngineVersion = (props: Props) => {
  const {
    databaseEngine: engine,
    databaseID,
    databasePendingUpdates,
    databaseVersion: version,
  } = props;

  const engineVersion = getDatabasesDescription({ engine, version });
  const hasUpdates = hasPendingUpdates(databasePendingUpdates);

  return (
    <>
      {engineVersion}
      {hasUpdates && (
        <StyledLink
          accessibleAriaLabel="Database Engine"
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
