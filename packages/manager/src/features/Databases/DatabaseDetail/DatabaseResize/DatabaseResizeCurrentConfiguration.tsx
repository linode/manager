import { Region } from '@linode/api-v4';
import {
  Database,
  DatabaseInstance,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useInProgressEvents } from 'src/queries/events/events';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import { databaseEngineMap } from '../../DatabaseLanding/DatabaseRow';
import { DatabaseStatusDisplay } from '../DatabaseStatusDisplay';
import {
  StyledStatusBox,
  StyledSummaryBox,
  StyledSummaryTextBox,
  StyledSummaryTextTypography,
  StyledTitleTypography,
} from './DatabaseResizeCurrentConfiguration.style';

interface Props {
  database: Database;
}

export const getDatabaseVersionNumber = (
  version: DatabaseInstance['version']
) => version.split('/')[1];

export const DatabaseResizeCurrentConfiguration = ({ database }: Props) => {
  const {
    data: types,
    error: typesError,
    isLoading: typesLoading,
  } = useDatabaseTypesQuery();
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
            {databaseEngineMap[database.engine]} v{database.version}
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
