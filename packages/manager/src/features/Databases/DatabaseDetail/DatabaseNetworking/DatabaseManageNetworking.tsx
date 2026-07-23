import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useAllVPCsQuery } from '@linode/queries';
import React from 'react';

import { Link } from 'src/components/Link';

import { MANAGE_NETWORKING_LEARN_MORE_LINK } from '../../constants';
import { makeSettingsItemStyles } from '../../shared.styles';
import { CircleProgress } from '../../shared/CircleProgress/CircleProgress';
import { ErrorState } from '../../shared/ErrorState/ErrorState';
import { Stack } from '../../shared/Stack/Stack';
import { ConnectionDetailsHostRows } from '../ConnectionDetailsHostRows';
import { ConnectionDetailsRow } from '../ConnectionDetailsRow';
import DatabaseManageNetworkingDrawer from './DatabaseManageNetworkingDrawer';
import { DatabaseNetworkingUnassignVPCDialog } from './DatabaseNetworkingUnassignVPCDialog';

import type { Database } from '@linode/api-v4';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseManageNetworking = ({ database }: Props) => {
  const { classes } = makeSettingsItemStyles();
  const [isManageNetworkingDrawerOpen, setIsManageNetworkingDrawerOpen] =
    React.useState(false);
  const [isUnassignVPCDialogOpen, setIsUnassignVPCDialogOpen] =
    React.useState(false);

  const vpcId = Number(database.private_network?.vpc_id);
  const hasVPCConfigured = Boolean(vpcId);

  const {
    data: vpcs,
    error,
    isLoading,
  } = useAllVPCsQuery({
    enabled: !!database?.region,
    filter: { region: database?.region },
  });

  const currentVPC = vpcs?.find((vpc) => vpc.id === vpcId);

  const currentSubnet = currentVPC?.subnets.find(
    (subnet) => subnet.id === database?.private_network?.subnet_id
  );
  const hasVPCs = Boolean(vpcs && vpcs.length > 0);

  const onManageAccess = () => {
    setIsManageNetworkingDrawerOpen(true);
  };

  const handleUnassignVPC = () => {
    setIsManageNetworkingDrawerOpen(false);
    setIsUnassignVPCDialogOpen(true);
  };

  if (isLoading) {
    return <CircleProgress style={{ marginTop: Spacing.S32 }} />;
  }

  if (error || (hasVPCConfigured && !currentVPC)) {
    return (
      <ErrorState errorText="There was a problem retrieving your VPC assignment settings. Refresh the page or try again later." />
    );
  }

  return (
    <>
      <div className={classes.topSection}>
        <Stack spacing={Spacing.S4}>
          <div style={{ display: 'flex' }}>
            <h3 style={{ margin: 0 }}>Manage Networking</h3>
          </div>
          <p style={{ maxWidth: '500px', margin: 0 }}>
            Update access settings or the VPC assignment.{' '}
            <Link to={MANAGE_NETWORKING_LEARN_MORE_LINK}>Learn more.</Link>
            <br />
            Note that a change of VPC assignment settings can disrupt service
            availability. Avoid writing data to the database while a change is
            in progress.
          </p>
        </Stack>
        <Tooltip
          disabled={hasVPCs}
          tooltipText="To manage networking, you need to have a VPC in the same region as the database cluster."
        >
          <Button
            className={classes.actionBtn}
            disabled={!hasVPCs}
            onClick={onManageAccess}
          >
            Manage Networking
            {!hasVPCs ? <Icon icon="info-outline" size="m" /> : null}
          </Button>
        </Tooltip>
      </div>

      <div style={{ maxWidth: 700 }}>
        <ConnectionDetailsRow label="Connection Type">
          {hasVPCConfigured ? 'VPC' : 'Public'}
        </ConnectionDetailsRow>

        {hasVPCConfigured && (
          <>
            <ConnectionDetailsRow label="VPC">
              {currentVPC?.label}
            </ConnectionDetailsRow>
            <ConnectionDetailsRow label="Subnet">
              {`${currentSubnet?.label} (${currentSubnet?.ipv4})`}
            </ConnectionDetailsRow>
          </>
        )}
        <ConnectionDetailsHostRows database={database} />
        {hasVPCConfigured && (
          <ConnectionDetailsRow label="Public Access">
            {database?.private_network?.public_access ? 'Yes' : 'No'}
          </ConnectionDetailsRow>
        )}
      </div>

      <DatabaseManageNetworkingDrawer
        database={database}
        onClose={() => setIsManageNetworkingDrawerOpen(false)}
        onUnassign={handleUnassignVPC}
        open={isManageNetworkingDrawerOpen}
        vpc={currentVPC}
      />
      <DatabaseNetworkingUnassignVPCDialog
        databaseEngine={database?.engine}
        databaseId={database?.id}
        databaseLabel={database?.label}
        onClose={() => setIsUnassignVPCDialogOpen(false)}
        open={isUnassignVPCDialogOpen}
      />
    </>
  );
};
