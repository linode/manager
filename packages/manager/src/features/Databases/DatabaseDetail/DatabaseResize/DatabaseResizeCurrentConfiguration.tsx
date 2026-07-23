import { Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { formatStorageUnits } from '@akamai/compute-ui-core/api';
import { useDatabaseTypesQuery, useRegionsQuery } from '@linode/queries';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import {
  STORAGE_COPY,
  VALKEY_STORAGE_TOOLTIP_COPY,
} from 'src/features/Databases/constants';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { useInProgressEvents } from 'src/queries/events/events';

import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { ErrorState } from '../../shared/ErrorState/ErrorState';
import { DatabaseStatusDisplay } from '../DatabaseStatusDisplay';
import {
  StyledStatusDiv,
  StyledSummaryDiv,
  StyledSummaryTextDiv,
  StyledSummaryTextTypography,
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
    return <ErrorState />;
  }

  if (!database || !type) {
    return null;
  }

  const configuration =
    database.cluster_size === 1
      ? 'Primary (1 Node)'
      : database.cluster_size > 2
        ? `Primary (+${database.cluster_size - 1} Nodes)`
        : `Primary (+${database.cluster_size - 1} Node)`;

  const isValkeyDatabase = database.engine === 'valkey';

  return (
    <>
      <h4>Current Configuration</h4>
      <StyledSummaryDiv data-qa-db-configuration-summary>
        <div key={'status-version'} style={{ paddingRight: Spacing.S48 }}>
          <StyledSummaryTextDiv>
            <span style={{ font: theme.font.bold }}>Status</span>{' '}
            <StyledStatusDiv>
              <DatabaseStatusDisplay database={database} events={events} />
            </StyledStatusDiv>
          </StyledSummaryTextDiv>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>Version</span>{' '}
            <DatabaseEngineVersion
              databaseEngine={database.engine}
              databaseID={database.id}
              databasePendingUpdates={database.updates.pending}
              databaseVersion={database.version}
            />
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>Nodes</span> {configuration}
          </StyledSummaryTextTypography>
        </div>
        <div key={'region-plan'} style={{ paddingRight: Spacing.S48 }}>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>Region</span>{' '}
            {region?.label ?? database.region}
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>Plan</span>{' '}
            {formatStorageUnits(type.label)}
          </StyledSummaryTextTypography>
        </div>

        <div key={'ram-cpu'} style={{ paddingRight: Spacing.S48 }}>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>RAM</span>{' '}
            {type.memory / 1024} GB
          </StyledSummaryTextTypography>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>CPUs</span> {type.vcpus}
          </StyledSummaryTextTypography>
        </div>
        <div key={'disk'} style={{ paddingRight: Spacing.S48 }}>
          <StyledSummaryTextTypography>
            <span style={{ font: theme.font.bold }}>Usable Disk Size</span>{' '}
            {isValkeyDatabase ? 'N/A' : `${database.total_disk_size_gb} GB`}
            <Tooltip
              style={{ marginLeft: Spacing.S4, whiteSpace: 'normal' }}
              tooltipText={
                isValkeyDatabase ? VALKEY_STORAGE_TOOLTIP_COPY : STORAGE_COPY
              }
            >
              <Icon
                icon="info-outline"
                size="m"
                style={{
                  position: 'relative',
                  top: -2,
                }}
              />
            </Tooltip>
          </StyledSummaryTextTypography>
          {!isValkeyDatabase && (
            <StyledSummaryTextTypography>
              <span style={{ font: theme.font.bold }}>Used</span>{' '}
              {database.used_disk_size_gb !== null
                ? `${database.used_disk_size_gb} GB`
                : 'N/A'}
            </StyledSummaryTextTypography>
          )}
        </div>
      </StyledSummaryDiv>
    </>
  );
};
