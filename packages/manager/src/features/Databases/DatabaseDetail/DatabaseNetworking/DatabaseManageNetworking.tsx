import { useAllVPCsQuery } from '@linode/queries';
import {
  BetaChip,
  Button,
  CircleProgress,
  ErrorState,
  Typography,
} from '@linode/ui';
import React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

import { MANAGE_NETWORKING_LEARN_MORE_LINK } from '../../constants';
import ConnectionDetailsHostRows from '../ConnectionDetailsHostRows';
import ConnectionDetailsRow from '../ConnectionDetailsRow';
import { StyledGridContainer } from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import DatabaseManageNetworkingDrawer from './DatabaseManageNetworkingDrawer';
import { DatabaseNetworkingUnassignVPCDialog } from './DatabaseNetworkingUnassignVPCDialog';

import type { Database } from '@linode/api-v4';
import type { Theme } from '@mui/material';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseManageNetworking = ({ database }: Props) => {
  const useStyles = makeStyles()((theme: Theme) => ({
    manageNetworkingBtn: {
      minWidth: 225,
      [theme.breakpoints.down('md')]: {
        alignSelf: 'flex-start',
        marginTop: '1rem',
        marginBottom: '1rem',
      },
    },
    sectionText: {
      marginBottom: '1rem',
      marginRight: 0,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
      width: '65%',
    },
    sectionTitle: {
      marginBottom: '0.25rem',
      display: 'flex',
    },
    sectionTitleAndText: {
      width: '100%',
    },
    topSection: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
      },
    },
  }));

  const flags = useFlags();
  const { classes } = useStyles();
  const [isManageNetworkingDrawerOpen, setIsManageNetworkingDrawerOpen] =
    React.useState(false);
  const [isUnassignVPCDialogOpen, setIsUnassignVPCDialogOpen] =
    React.useState(false);

  const vpcId = Number(database.private_network?.vpc_id);
  const hasVPCConfigured = Boolean(vpcId);
  const gridContainerSize = { lg: 7, md: 10 };

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
    return <CircleProgress />;
  }

  if (error || (hasVPCConfigured && !currentVPC)) {
    return (
      <ErrorState errorText="There was a problem retrieving your VPC assignment settings. Refresh the page or try again later." />
    );
  }

  return (
    <>
      <div className={classes.topSection}>
        <div className={classes.sectionTitleAndText}>
          <div className={classes.sectionTitle}>
            <Typography variant="h3">Manage Networking</Typography>
            {flags.databaseVpcBeta && <BetaChip />}
          </div>
          <Typography sx={{ maxWidth: '500px' }}>
            Update access settings or the VPC assignment.{' '}
            <Link
              to={`${MANAGE_NETWORKING_LEARN_MORE_LINK + (flags.databaseVpcBeta ? '-beta' : '')}`}
            >
              Learn more.
            </Link>
            <br />
            Note that a change of VPC assignment settings can disrupt service
            availability. Avoid writing data to the database while a change is
            in progress.
          </Typography>
        </div>
        <Button
          buttonType="outlined"
          className={classes.manageNetworkingBtn}
          disabled={!hasVPCs}
          onClick={onManageAccess}
          TooltipProps={{ placement: 'top' }}
          tooltipText="To manage networking, you need to have a VPC in the same region as the database cluster."
        >
          Manage Networking
        </Button>
      </div>

      <StyledGridContainer container size={gridContainerSize} spacing={0}>
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
      </StyledGridContainer>

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
