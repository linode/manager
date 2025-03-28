import { Divider, Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { Link } from 'src/components/Link';
import AccessControls from 'src/features/Databases/DatabaseDetail/AccessControls';
import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';
import ClusterConfigurationLegacy from 'src/features/Databases/DatabaseDetail/DatabaseSummary/legacy/DatabaseSummaryClusterConfigurationLegacy';
import ConnectionDetailsLegacy from 'src/features/Databases/DatabaseDetail/DatabaseSummary/legacy/DatabaseSummaryConnectionDetailsLegacy';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseSummary: React.FC<Props> = (props) => {
  const { database, disabled } = props;
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const description = (
    <>
      <Typography>
        Add IPv4 addresses or ranges that should be authorized to access this
        cluster. All other public and private connections are denied.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/manage-access-controls">
          Learn more
        </Link>
        .
      </Typography>
      <Typography style={{ marginTop: 12 }}>
        You can add or modify access controls after your database cluster is
        active.
      </Typography>
    </>
  );

  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid
          size={{
            md: isDatabasesV2GA ? 12 : 4,
            sm: 12,
          }}
        >
          {isDatabasesV2GA ? (
            <ClusterConfiguration database={database} />
          ) : (
            // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
            // TODO (UIE-8214) remove POST GA
            <ClusterConfigurationLegacy database={database} />
          )}
        </Grid>
        <Grid
          size={{
            md: isDatabasesV2GA ? 12 : 8,
            sm: 12,
          }}
        >
          {isDatabasesV2GA ? (
            <ConnectionDetails database={database} />
          ) : (
            // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
            // TODO (UIE-8214) remove POST GA
            <ConnectionDetailsLegacy database={database} />
          )}
        </Grid>
      </Grid>
      {!isDatabasesV2GA && (
        // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
        // AccessControls accessible through dropdown menu on landing page table and on settings tab
        // TODO (UIE-8214) remove POST GA
        <>
          <Divider spacingBottom={16} spacingTop={28} />
          <AccessControls
            database={database}
            description={description}
            disabled={disabled}
          />
        </>
      )}
    </Paper>
  );
};

export default DatabaseSummary;
