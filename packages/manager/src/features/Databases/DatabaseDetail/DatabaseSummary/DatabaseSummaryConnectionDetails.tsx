import { toast } from '@akamai/cds-components/notification-toast';
import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseCredentialsQuery } from '@linode/queries';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DB_ROOT_USERNAME } from 'src/constants';
import {
  CLUSTER_PROVISIONING_TEXT,
  CREDENTIALS_ERROR_TEXT,
  DISABLE_CREDENTIAL_STATES,
  DISABLED_PASSWORD_BUTTON_TEXT,
} from 'src/features/Databases/constants';

import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { CopyTooltip } from '../../shared/CopyTooltip/CopyTooltip';
import { ConnectionDetailsHostRows } from '../ConnectionDetailsHostRows';
import { ConnectionDetailsRow } from '../ConnectionDetailsRow';
import { ServiceURI } from '../ServiceURI';
import { useStyles } from './DatabaseSummaryConnectionDetails.style';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
}

export const DatabaseSummaryConnectionDetails = (props: Props) => {
  const { database } = props;
  const { classes } = useStyles();
  const hasVPC = Boolean(database?.private_network?.vpc_id);

  const [showCredentials, setShowPassword] = React.useState<boolean>(false);

  const {
    data: credentials,
    error: credentialsError,
    isLoading: credentialsLoading,
    refetch: getDatabaseCredentials,
  } = useDatabaseCredentialsQuery(database.engine, database.id);

  const username =
    database.platform === 'rdbms-default'
      ? 'akmadmin'
      : database.engine === 'postgresql'
        ? 'linpostgres'
        : DB_ROOT_USERNAME;

  const password =
    showCredentials && credentials ? credentials?.password : '••••••••••';

  const handleShowPasswordClick = () => {
    setShowPassword((showCredentials) => !showCredentials);
    getDatabaseCredentials();
  };

  React.useEffect(() => {
    if (showCredentials && credentialsError) {
      setShowPassword(false);
      toast.open({ text: CREDENTIALS_ERROR_TEXT, type: 'error' });
    }
  }, [showCredentials, credentialsError]);

  const disableShowBtn = DISABLE_CREDENTIAL_STATES.includes(database.status);

  const credentialsBtn = (handleClick: () => void, btnText: string) => {
    return (
      <Button
        className={classes.showBtn}
        data-testid="show-hide-credentials"
        disabled={disableShowBtn}
        onClick={handleClick}
        variant="link"
      >
        {btnText}
      </Button>
    );
  };

  const CredentialsContent = (
    <>
      {password}
      {showCredentials && credentialsLoading ? (
        <div className={classes.progressCtn}>
          <CircleProgress size="small" style={{ height: 'auto', margin: 0 }} />
        </div>
      ) : (
        credentialsBtn(
          handleShowPasswordClick,
          showCredentials && credentials ? 'Hide' : 'Show'
        )
      )}
      {disableShowBtn && (
        <Tooltip
          style={{ marginLeft: Spacing.S4 }}
          tooltipText={
            database.status === 'provisioning'
              ? CLUSTER_PROVISIONING_TEXT
              : DISABLED_PASSWORD_BUTTON_TEXT
          }
        >
          <Icon icon="info-outline" size="m" />
        </Tooltip>
      )}
      {showCredentials && credentials && (
        <CopyTooltip className={classes.inlineCopyToolTip} text={password} />
      )}
    </>
  );

  const hasPublicVPC = hasVPC && database.private_network?.public_access;

  return (
    <div style={{ marginBottom: Spacing.S16 }}>
      <h3 className={classes.header}>Connection Details</h3>
      <ConnectionDetailsRow
        isSummaryTab
        label={`${hasPublicVPC ? 'Public Service URI' : 'Service URI'} `}
      >
        <ServiceURI database={database} isGeneralServiceURI />
      </ConnectionDetailsRow>
      {hasPublicVPC && (
        <ConnectionDetailsRow isSummaryTab label="Private Service URI">
          <ServiceURI
            database={database}
            isGeneralServiceURI
            showPrivateVPC={true}
          />
        </ConnectionDetailsRow>
      )}
      <ConnectionDetailsRow isSummaryTab label="Username">
        {username}
      </ConnectionDetailsRow>
      <ConnectionDetailsRow isSummaryTab label="Password">
        {CredentialsContent}
      </ConnectionDetailsRow>
      {database.engine !== 'valkey' && (
        <ConnectionDetailsRow isSummaryTab label="Database name">
          defaultdb
        </ConnectionDetailsRow>
      )}
      <ConnectionDetailsHostRows database={database} isSummaryTab />
      <ConnectionDetailsRow isSummaryTab label="Port">
        {database.port}
      </ConnectionDetailsRow>
      <ConnectionDetailsRow isSummaryTab label="SSL">
        {database.ssl_connection ? 'ENABLED' : 'DISABLED'}
      </ConnectionDetailsRow>
      <ConnectionDetailsRow isSummaryTab label="Connection Type">
        <div style={{ marginRight: Spacing.S20 }}>
          {hasVPC ? 'VPC' : 'Public'}
        </div>
        <Link to={`/databases/${database?.engine}/${database?.id}/networking`}>
          View Details
        </Link>
      </ConnectionDetailsRow>
    </div>
  );
};

export default DatabaseSummaryConnectionDetails;
