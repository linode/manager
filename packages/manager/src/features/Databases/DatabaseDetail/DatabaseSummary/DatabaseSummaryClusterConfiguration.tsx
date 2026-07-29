import { Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { formatStorageUnits } from '@akamai/compute-ui-core/api';
import { useDatabaseTypesQuery, useRegionsQuery } from '@linode/queries';
import * as React from 'react';

import {
  STORAGE_COPY,
  VALKEY_STORAGE_TOOLTIP_COPY,
} from 'src/features/Databases/constants';
import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { useInProgressEvents } from 'src/queries/events/events';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { cssVars } from '../../shared/utilities/cssVars';
import styles from '../DatabaseDetail.module.css';

import type { Region } from '@linode/api-v4';
import type {
  Database,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
}

export const DatabaseSummaryClusterConfiguration = (props: Props) => {
  const { database } = props;
  const isMdDown = useBreakpoint('down', 'md');
  const isLgDown = useBreakpoint('down', 'lg');

  let clusterConfigurationGridLayout = 'repeat(4, auto 1fr)';
  if (isMdDown) {
    clusterConfigurationGridLayout = 'repeat(1, auto 1fr)';
  } else if (isLgDown) {
    clusterConfigurationGridLayout = 'repeat(2, auto 1fr)';
  }

  const style = cssVars({
    '--cluster-configuration-grid-layout': clusterConfigurationGridLayout,
  });

  const { data: types } = useDatabaseTypesQuery({
    platform: database.platform,
  });

  const type = types?.find((type: DatabaseType) => type.id === database?.type);

  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r: Region) => r.id === database.region);

  const { data: events } = useInProgressEvents();

  if (!database || !type) {
    return (
      <div style={{ marginBottom: Spacing.S16 }}>
        <h3 style={{ marginTop: 0 }}>Cluster Configuration</h3>
      </div>
    );
  }

  const nodeCount = database.cluster_size - 1;
  const nodeLabel = nodeCount === 1 ? 'Node' : 'Nodes';
  const configuration =
    database.cluster_size === 1
      ? 'Primary (1 Node)'
      : `Primary (+${nodeCount} ${nodeLabel})`;

  const isValkeyDatabase = database.engine === 'valkey';

  return (
    <div style={{ marginBottom: Spacing.S16 }}>
      <h3 style={{ marginTop: 0 }}>Cluster Configuration</h3>
      <div className={styles.summaryLabelValueContainer} style={style}>
        <div className={styles.summaryLabelColumn}>
          <p>Status</p>
        </div>
        <div className={styles.summaryValueColumn}>
          <DatabaseStatusDisplay database={database} events={events} />
        </div>
        <div className={styles.summaryLabelColumn}>
          <p>Plan</p>
        </div>
        <div className={styles.summaryValueColumn}>
          {formatStorageUnits(type.label)}
        </div>
        <div className={styles.summaryLabelColumn}>
          <p>Nodes</p>
        </div>
        <div className={styles.summaryValueColumn}>{configuration}</div>
        <div className={styles.summaryLabelColumn}>
          <p>CPUs</p>
        </div>
        <div className={styles.summaryValueColumn}>{type.vcpus}</div>
        <div className={styles.summaryLabelColumn}>
          <p>Engine</p>
        </div>
        <div className={styles.summaryValueColumn}>
          <DatabaseEngineVersion
            databaseEngine={database.engine}
            databaseID={database.id}
            databasePendingUpdates={database.updates.pending}
            databaseVersion={database.version}
          />
        </div>
        <div className={styles.summaryLabelColumn}>
          <p>Region</p>
        </div>
        <div className={styles.summaryValueColumn}>
          {region?.label ?? database.region}
        </div>
        <div className={styles.summaryLabelColumn}>
          <p>RAM</p>
        </div>
        <div className={styles.summaryValueColumn}>{type.memory / 1024} GB</div>
        <div className={styles.summaryLabelColumn}>
          <p>Usable Disk Size</p>
        </div>
        <div className={styles.summaryValueColumn}>
          {isValkeyDatabase ? 'N/A' : `${database.total_disk_size_gb} GB`}
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipPlacement="bottom"
            tooltipText={
              isValkeyDatabase ? VALKEY_STORAGE_TOOLTIP_COPY : STORAGE_COPY
            }
          >
            <Icon
              icon="info-outline"
              size="m"
              style={{ position: 'relative', top: -1 }}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSummaryClusterConfiguration;
