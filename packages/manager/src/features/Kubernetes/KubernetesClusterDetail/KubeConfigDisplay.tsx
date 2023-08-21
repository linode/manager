import { Box } from 'src/components/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import DetailsIcon from 'src/assets/icons/code-file.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import { Typography } from 'src/components/Typography';
import {
  useAllKubernetesClusterAPIEndpointsQuery,
  useKubenetesKubeConfigQuery,
} from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  clusterId: number;
  clusterLabel: string;
  handleOpenDrawer: () => void;
  isResettingKubeConfig: boolean;
  setResetKubeConfigDialogOpen: (open: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  disabled: {
    '& g': {
      stroke: theme.palette.text.secondary,
    },
    color: theme.palette.text.secondary,
    pointer: 'default',
    pointerEvents: 'none',
  },
  kubeconfigElement: {
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
  kubeconfigElements: {
    alignItems: 'center',
    color: theme.palette.primary.main,
    display: 'flex',
  },
  kubeconfigFileText: {
    color: theme.textColors.linkActiveLight,
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  kubeconfigIcons: {
    height: 16,
    margin: `0 ${theme.spacing(1)}`,
    objectFit: 'contain',
    width: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: `calc(${theme.spacing(1)} - 3px)`,
  },
}));

const renderEndpoint = (
  endpoint: null | string | undefined,
  endpointLoading: boolean,
  endpointError?: string
) => {
  if (endpoint) {
    return endpoint;
  }
  if (endpointLoading) {
    return 'Loading...';
  }
  if (endpointError) {
    return endpointError;
  }
  return 'Your endpoint will be displayed here once it is available.';
};

export const KubeConfigDisplay = (props: Props) => {
  const {
    clusterId,
    clusterLabel,
    handleOpenDrawer,
    isResettingKubeConfig,
    setResetKubeConfigDialogOpen,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const { refetch } = useKubenetesKubeConfigQuery(clusterId);

  const {
    data: endpoints,
    error: endpointsError,
    isLoading: endpointsLoading,
  } = useAllKubernetesClusterAPIEndpointsQuery(clusterId);

  const downloadKubeConfig = async () => {
    try {
      const { data } = await refetch();

      if (data) {
        downloadFile(`${clusterLabel}-kubeconfig.yaml`, data);
      }
    } catch (error) {
      const errorText = getAPIErrorOrDefault(
        error,
        'Unable to download your kubeconfig'
      )[0].reason;

      enqueueSnackbar(errorText, { variant: 'error' });
    }
  };

  const getEndpointToDisplay = (endpoints: string[]) => {
    // Per discussions with the API team and UX, we should display only the endpoint with port 443, so we are matching on that.
    return endpoints.find((thisResponse) =>
      thisResponse.match(/linodelke\.net:443$/i)
    );
  };

  return (
    <>
      <Grid xs={12}>
        <Typography className={classes.label}>
          Kubernetes API Endpoint:
        </Typography>
        <Typography>
          {renderEndpoint(
            getEndpointToDisplay(
              endpoints?.map((endpoint) => endpoint.endpoint) ?? []
            ),
            endpointsLoading,
            endpointsError?.[0].reason
          )}
        </Typography>
      </Grid>
      <Grid xs={12}>
        <Typography className={classes.label} style={{ marginTop: 8 }}>
          Kubeconfig:
        </Typography>
        <div className={classes.kubeconfigElements}>
          <Box
            className={classes.kubeconfigElement}
            onClick={downloadKubeConfig}
          >
            <DownloadIcon
              className={classes.kubeconfigIcons}
              style={{ marginLeft: 0 }}
            />
            <Typography className={classes.kubeconfigFileText}>
              {`${clusterLabel}-kubeconfig.yaml`}
            </Typography>
          </Box>
          <Box className={classes.kubeconfigElement} onClick={handleOpenDrawer}>
            <DetailsIcon className={classes.kubeconfigIcons} />
            <Typography className={classes.kubeconfigFileText}>View</Typography>
          </Box>
          <Box
            className={classes.kubeconfigElement}
            onClick={() => setResetKubeConfigDialogOpen(true)}
          >
            <ResetIcon
              className={classNames({
                [classes.disabled]: isResettingKubeConfig,
                [classes.kubeconfigIcons]: true,
              })}
            />
            <Typography
              className={classNames({
                [classes.disabled]: isResettingKubeConfig,
                [classes.kubeconfigFileText]: true,
              })}
            >
              Reset
            </Typography>
          </Box>
        </div>
      </Grid>
    </>
  );
};
