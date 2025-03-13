import { useAllAccountAvailabilitiesQuery } from '@linode/queries';
import { Divider, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import React from 'react';

import { Flag } from 'src/components/Flag';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import {
  StyledLabelTooltip,
  StyledTextField,
} from 'src/features/Databases/DatabaseCreate/DatabaseCreate.style';
import { DatabaseEngineSelect } from 'src/features/Databases/DatabaseCreate/DatabaseEngineSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type {
  ClusterSize,
  DatabaseEngine,
  Engine,
  MySQLReplicationType,
  PostgresReplicationType,
  Region,
  ReplicationCommitTypes,
} from '@linode/api-v4';
import type { FormikErrors } from 'formik';
export interface DatabaseCreateValues {
  allow_list: {
    address: string;
    error: string;
  }[];
  cluster_size: ClusterSize;
  engine: Engine;
  label: string;
  region: string;
  /** @Deprecated used by rdbms-legacy PostgreSQL only */
  replication_commit_type?: ReplicationCommitTypes;
  /** @Deprecated used by rdbms-legacy only */
  replication_type?: MySQLReplicationType | PostgresReplicationType;
  /** @Deprecated used by rdbms-legacy only, rdbms-default always uses TLS */
  ssl_connection?: boolean;
  type: string;
}

interface Props {
  engines: DatabaseEngine[] | undefined;
  errors: FormikErrors<DatabaseCreateValues>;
  onChange: (filed: string, value: any) => void;
  regionsData: Region[];
  values: DatabaseCreateValues;
}
export const DatabaseClusterData = (props: Props) => {
  const { engines, errors, onChange, regionsData, values } = props;
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const flags = useFlags();

  const {
    data: accountAvailabilityData,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  const labelToolTip = (
    <StyledLabelTooltip>
      <strong>Label must:</strong>
      <ul>
        <li>Begin with an alpha character</li>
        <li>Contain only alpha characters or single hyphens</li>
        <li>Be between 3 - 32 characters</li>
      </ul>
    </StyledLabelTooltip>
  );

  return (
    <>
      <Grid>
        <Typography variant="h2">Name Your Cluster</Typography>
        <StyledTextField
          data-qa-label-input
          disabled={isRestricted}
          errorText={errors.label}
          label="Cluster Label"
          onChange={(e) => onChange('label', e.target.value)}
          tooltipText={labelToolTip}
          value={values.label}
        />
      </Grid>
      <Divider spacingBottom={12} spacingTop={38} />
      <Grid>
        <Typography variant="h2">Select Engine and Region</Typography>
        <DatabaseEngineSelect
          engines={engines}
          errorText={errors.engine}
          onChange={onChange}
          value={values.engine}
        />
      </Grid>
      <Grid>
        <RegionSelect
          FlagComponent={Flag}
          accountAvailabilityData={accountAvailabilityData}
          accountAvailabilityLoading={accountAvailabilityLoading}
          currentCapability="Managed Databases"
          disableClearable
          disabled={isRestricted}
          errorText={errors.region}
          flags={flags}
          onChange={(e, region) => onChange('region', region.id)}
          regions={regionsData}
          value={values.region}
        />
        <RegionHelperText mt={1} />
      </Grid>
    </>
  );
};
