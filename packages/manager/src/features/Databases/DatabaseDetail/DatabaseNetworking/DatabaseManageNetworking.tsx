import { useAllVPCsQuery } from '@linode/queries';
import { Button, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { makeStyles } from 'tss-react/mui';

import { getReadOnlyHost } from '../../utilities';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from '../DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
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
    provisioningText: {
      font: theme.font.normal,
      fontStyle: 'italic',
    },
  }));

  const { classes } = useStyles();
  const [isManageNetworkingDrawerOpen, setIsManageNetworkingDrawerOpen] =
    React.useState(false);
  const [isUnassignVPCDialogOpen, setIsUnassignVPCDialogOpen] =
    React.useState(false);

  const vpcId = Number(database.private_network?.vpc_id);
  const hasVPCConfigured = Boolean(vpcId);
  const gridContainerSize = { lg: 7, md: 10 };
  const gridValueSize = { md: 8, xs: 9 };
  const gridLabelSize = { md: 4, xs: 3 };

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

  const readOnlyHost = () => {
    const defaultValue = 'N/A';
    const value = getReadOnlyHost(database) || defaultValue;
    return <span>{value}</span>;
  };

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
          </div>
          <Typography sx={{ maxWidth: '500px' }}>
            Update access settings or the VPC assignment.
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
        <Grid size={gridLabelSize}>
          <StyledLabelTypography>Connection Type</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={gridValueSize}>
          {hasVPCConfigured ? 'VPC' : 'Public'}
        </StyledValueGrid>
        {hasVPCConfigured && (
          <>
            <Grid size={gridLabelSize}>
              <StyledLabelTypography>VPC</StyledLabelTypography>
            </Grid>
            <StyledValueGrid size={gridValueSize}>
              {currentVPC?.label}
            </StyledValueGrid>
            <Grid size={gridLabelSize}>
              <StyledLabelTypography>Subnet</StyledLabelTypography>
            </Grid>
            <StyledValueGrid size={gridValueSize}>
              {`${currentSubnet?.label} (${currentSubnet?.ipv4})`}
            </StyledValueGrid>
          </>
        )}

        <Grid size={gridLabelSize}>
          <StyledLabelTypography>Host</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={gridValueSize}>
          {database.hosts?.primary ? (
            database.hosts?.primary
          ) : (
            <span className={classes.provisioningText}>
              Your hostname will appear here once it is available.
            </span>
          )}
        </StyledValueGrid>
        <Grid size={gridLabelSize}>
          <StyledLabelTypography>Read-only Host</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={gridValueSize}>{readOnlyHost()}</StyledValueGrid>
        {hasVPCConfigured && (
          <>
            <Grid size={gridLabelSize}>
              <StyledLabelTypography>Public Access</StyledLabelTypography>
            </Grid>
            <StyledValueGrid size={gridValueSize}>
              {database?.private_network?.public_access ? 'Yes' : 'No'}
            </StyledValueGrid>
          </>
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
