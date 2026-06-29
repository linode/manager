import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';
import { useFlags } from 'src/hooks/useFlags';

import { Paper } from '../../shared/Paper/Paper';
import styles from '../DatabaseDetail.module.css';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { ServiceURI } from '../ServiceURI';
import { DatabaseCaCert } from './DatabaseCaCert';

export const DatabaseSummary = () => {
  const { database } = useDatabaseDetailContext();
  const flags = useFlags();

  const pgBouncerEnabled =
    flags.databasePgBouncer && database.engine === 'postgresql';

  const { data: connectionPools } = useDatabaseConnectionPoolsQuery(
    database.id,
    pgBouncerEnabled,
    {}
  );

  const showPgBouncerConnectionDetails =
    pgBouncerEnabled && connectionPools && connectionPools.data.length > 0;

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database.private_network?.public_access;

  return (
    <Paper>
      <ClusterConfiguration database={database} />
      <ConnectionDetails database={database} />
      {flags.hostnameEndpoints && showPgBouncerConnectionDetails && (
        <>
          <h3>PgBouncer Connection Details</h3>
          <div className={styles.summaryLabelValueContainer}>
            <div className={styles.summaryLabelColumn}>
              <p>{hasPublicVPC ? 'Public Service URI' : 'Service URI'}</p>
            </div>
            <div className={styles.summaryValueColumn}>
              <ServiceURI database={database} />
            </div>
            {hasPublicVPC && (
              <>
                <div className={styles.summaryLabelColumn}>
                  <p>Private Service URI</p>
                </div>
                <div className={styles.summaryValueColumn}>
                  <ServiceURI database={database} showPrivateVPC />
                </div>
              </>
            )}
          </div>
        </>
      )}
      {database.ssl_connection && (
        <StyledButtonCtn>
          <DatabaseCaCert database={database} />
        </StyledButtonCtn>
      )}
    </Paper>
  );
};

export const StyledButtonCtn = styled('div', {
  label: 'StyledButtonCtn',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '10px',
  padding: `${theme.spacingFunction(8)} 0`,
}));
