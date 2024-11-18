import { Box, CircleProgress, TooltipIcon } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useInProgressEvents } from 'src/queries/events/events';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import { DatabaseStatusDisplay } from '../DatabaseStatusDisplay';
import {
  StyledStatusBox,
  StyledSummaryBox,
  StyledSummaryTextBox,
  StyledSummaryTextTypography,
  StyledTitleTypography,
} from './DatabaseResizeCurrentConfiguration.style';

import type { Region } from '@linode/api-v4';
import type {
  Database,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
}

export const DatabaseResizeCurrentConfiguration = ({ database }: Props) => {
  const {
    data: types,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery({ platform: database.platform });
  const theme = useTheme();
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r: Region) => r.id === database.region);

  const type = types?.find((type: DatabaseType) => type.id === database?.type);

  const { data: events } = useInProgressEvents();
  if (typesLoading) {
    return <CircleProgress />;
  }

  if (typesError) {
    return <ErrorState errorText="An unexpected error occurred." />;
  }

  if (!database || !type) {
    return null;
  }

  const configuration =
    database.cluster_size === 1
      ? 'Primary'
      : `Primary +${database.cluster_size - 1} replicas`;

  const sxTooltipIcon = {
    marginLeft: 0.5,
    padding: 0,
  };

  const STORAGE_COPY =
    'The total disk size is smaller than the selected plan capacity due to overhead from the OS.';

  return (
    <>
      <StyledTitleTypography variant="h3">
        Current Configuration
      </StyledTitleTypography>
      <StyledSummaryBox
        data-qa-db-configuration-summary
        display="flex"
        flex={1}
      >
        <Box key={'status-version'} paddingRight={6}>
          <StyledSummaryTextBox>
            <span style={{ fontFamily: theme.font.bold }}>Status</span>{' '}
            <StyledStatusBox>
              <DatabaseStatusDisplay database={database} events={events} />
            </StyledStatusBox>
          </StyledSummaryTextBox>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>Version</span>{' '}
            <DatabaseEngineVersion
              databaseEngine={database.engine}
              databaseID={database.id}
              databasePendingUpdates={database.updates.pending}
              databasePlatform={database.platform}
              databaseVersion={database.version}
            />
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>Nodes</span>{' '}
            {configuration}
          </StyledSummaryTextTypography>
        </Box>
        <Box key={'region-plan'} paddingRight={6}>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>Region</span>{' '}
            {region?.label ?? database.region}
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>Plan</span>{' '}
            {formatStorageUnits(type.label)}
          </StyledSummaryTextTypography>
        </Box>

        <Box key={'ram-cpu'} paddingRight={6}>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>RAM</span>{' '}
            {type.memory / 1024} GB
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ fontFamily: theme.font.bold }}>CPUs</span>{' '}
            {type.vcpus}
          </StyledSummaryTextTypography>
        </Box>
        <Box key={'disk'} paddingRight={6}>
          {database.total_disk_size_gb ? (
            <>
              <StyledSummaryTextTypography>
                <span style={{ fontFamily: theme.font.bold }}>
                  Total Disk Size
                </span>{' '}
                {database.total_disk_size_gb} GB
                <TooltipIcon
                  status="help"
                  sxTooltipIcon={sxTooltipIcon}
                  text={STORAGE_COPY}
                />
              </StyledSummaryTextTypography>
              <StyledSummaryTextTypography>
                <span style={{ fontFamily: theme.font.bold }}>Used</span>{' '}
                {database.used_disk_size_gb} GB
              </StyledSummaryTextTypography>
            </>
          ) : (
            <StyledSummaryTextTypography>
              <span style={{ fontFamily: theme.font.bold }}>Storage</span>{' '}
              {convertMegabytesTo(type.disk, true)}
            </StyledSummaryTextTypography>
          )}
        </Box>
      </StyledSummaryBox>
    </>
  );
};
