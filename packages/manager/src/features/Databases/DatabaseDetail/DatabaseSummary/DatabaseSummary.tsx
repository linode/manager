import type { Database } from '@linode/api-v4/lib/databases/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Divider } from 'src/components/Divider';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import AccessControls from 'src/features/Databases/DatabaseDetail/AccessControls';
import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';
import ClusterConfigurationLegacy from 'src/features/Databases/DatabaseDetail/DatabaseSummary/legacy/DatabaseSummaryClusterConfigurationLegacy';
import ConnectionDetailsLegacy from 'src/features/Databases/DatabaseDetail/DatabaseSummary/legacy/DatabaseSummaryConnectionDetailsLegacy';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseSummary: React.FC<Props> = (props) => {
  const { database, disabled } = props;
  const { isV2GAUser } = useIsDatabasesEnabled();

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
        <Grid md={isV2GAUser ? 12 : 4} sm={12}>
          {isV2GAUser ? (
            <ClusterConfiguration database={database} />
          ) : (
            // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
            <ClusterConfigurationLegacy database={database} />
          )}
        </Grid>
        <Grid md={isV2GAUser ? 12 : 8} sm={12}>
          {isV2GAUser ? (
            <ConnectionDetails database={database} />
          ) : (
            // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
            <ConnectionDetailsLegacy database={database} />
          )}
        </Grid>
      </Grid>
      {!isV2GAUser && (
        // Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
        // AccessControls accessible through dropdown menu on landing page table and on settings tab
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
