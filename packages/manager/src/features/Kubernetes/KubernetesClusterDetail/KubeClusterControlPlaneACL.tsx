import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { Typography } from 'src/components/Typography';
import { useKubernetesControlPlaneACLQuery } from 'src/queries/kubernetes';
import { pluralize } from 'src/utilities/pluralize';

import type { KubernetesCluster } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  cluster: KubernetesCluster;
  handleOpenDrawer: () => void;
  setControlPlaneACLMigrated: (s: boolean) => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  aclElement: {
    '&:hover': {
      opacity: 0.7,
    },
    '&:last-child': {
      borderRight: 'none',
    },
    alignItems: 'center',
    borderRight: '1px solid #c4c4c4',
    cursor: 'pointer',
    display: 'flex',
  },
  aclElementText: {
    color: theme.textColors.linkActiveLight,
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
  },
  item: {
    '&:first-of-type': {
      paddingTop: 0,
    },
    '&:last-of-type': {
      paddingBottom: 0,
    },
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  mainGridContainer: {
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between',
    },
  },
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(2.5)} ${theme.spacing(3)}`,
  },
  tooltip: {
    '& .MuiTooltip-tooltip': {
      minWidth: 320,
    },
  },
}));

export const KubeClusterControlPlaneACL = React.memo((props: Props) => {
  const { cluster, handleOpenDrawer, setControlPlaneACLMigrated } = props;
  const { classes } = useStyles();

  const {
    data: acl_response,
    isError: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(cluster.id);

  const enabledACL = acl_response ? acl_response.acl.enabled : false;
  // const revisionIDACL = acl_response ? acl_response.acl['revision-id'] : '';
  const totalIPv4 = acl_response?.acl.addresses?.ipv4?.length
    ? acl_response?.acl.addresses?.ipv4?.length
    : 0;
  const totalIPv6 = acl_response?.acl.addresses?.ipv6?.length
    ? acl_response?.acl.addresses?.ipv6?.length
    : 0;
  const totalNumberIPs = totalIPv4 + totalIPv6;

  const failedMigrationStatus = () => {
    // when a cluster has not migrated, the query will always fail
    setControlPlaneACLMigrated(!isErrorKubernetesACL);
    return isErrorKubernetesACL;
  };

  const EnabledCopy = () => {
    return (
      <Box className={classes.aclElement} onClick={handleOpenDrawer}>
        <Typography className={classes.aclElementText}>
          {pluralize('IP Address', 'IP Addresses', totalNumberIPs)}
        </Typography>
      </Box>
    );
  };

  const DisabledCopy = () => {
    return (
      <Box className={classes.aclElement} onClick={handleOpenDrawer}>
        <Typography className={classes.aclElementText}>Enable IPACL</Typography>
      </Box>
    );
  };

  const NotMigratedCopy = () => {
    return (
      <Box className={classes.aclElement} onClick={handleOpenDrawer}>
        <Typography className={classes.aclElementText}>
          Install IPACL
        </Typography>
      </Box>
    );
  };

  const availableActions = [
    isLoadingKubernetesACL ? (
      <Box sx={{ paddingLeft: 1 }}>
        <CircleProgress noPadding size="sm" />
      </Box>
    ) : failedMigrationStatus() ? (
      <NotMigratedCopy />
    ) : enabledACL ? (
      <EnabledCopy />
    ) : (
      <DisabledCopy />
    ),
  ];

  return (
    <Grid
      alignItems="center"
      className={classes.item}
      container
      direction="row"
      lg={10}
      wrap="nowrap"
    >
      <Typography>{availableActions}</Typography>
    </Grid>
  );
});
