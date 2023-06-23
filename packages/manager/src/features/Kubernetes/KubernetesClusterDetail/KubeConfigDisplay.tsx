import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import DetailsIcon from 'src/assets/icons/code-file.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import Typography from 'src/components/core/Typography';
import {
  useAllKubernetesClusterAPIEndpointsQuery,
  useKubenetesKubeConfigQuery,
} from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  clusterId: number;
  clusterLabel: string;
  isResettingKubeConfig: boolean;
  handleOpenDrawer: () => void;
  setResetKubeConfigDialogOpen: (open: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    fontWeight: 'bold',
    marginBottom: `calc(${theme.spacing(1)} - 3px)`,
  },
  kubeconfigElements: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
  },
  kubeconfigElement: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #c4c4c4',
    '&:hover': {
      opacity: 0.7,
    },
    '&:last-child': {
      borderRight: 'none',
    },
  },
  kubeconfigFileText: {
    color: theme.textColors.linkActiveLight,
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  kubeconfigIcons: {
    height: 16,
    width: 16,
    margin: `0 ${theme.spacing(1)}`,
    objectFit: 'contain',
  },
  disabled: {
    color: theme.palette.text.secondary,
    pointer: 'default',
    pointerEvents: 'none',
    '& g': {
      stroke: theme.palette.text.secondary,
    },
  },
}));

const renderEndpoint = (
  endpoint: string | undefined | null,
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
    isResettingKubeConfig,
    handleOpenDrawer,
    setResetKubeConfigDialogOpen,
  } = props;

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const { refetch } = useKubenetesKubeConfigQuery(clusterId);

  const {
    data: endpoints,
    isLoading: endpointsLoading,
    error: endpointsError,
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
            onClick={downloadKubeConfig}
            className={classes.kubeconfigElement}
          >
            <DownloadIcon
              className={classes.kubeconfigIcons}
              style={{ marginLeft: 0 }}
            />
            <Typography className={classes.kubeconfigFileText}>
              {`${clusterLabel}-kubeconfig.yaml`}
            </Typography>
          </Box>
          <Box onClick={handleOpenDrawer} className={classes.kubeconfigElement}>
            <DetailsIcon className={classes.kubeconfigIcons} />
            <Typography className={classes.kubeconfigFileText}>View</Typography>
          </Box>
          <Box
            onClick={() => setResetKubeConfigDialogOpen(true)}
            className={classes.kubeconfigElement}
          >
            <ResetIcon
              className={classNames({
                [classes.kubeconfigIcons]: true,
                [classes.disabled]: isResettingKubeConfig,
              })}
            />
            <Typography
              className={classNames({
                [classes.kubeconfigFileText]: true,
                [classes.disabled]: isResettingKubeConfig,
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
