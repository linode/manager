import { Box, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DetailsIcon from 'src/assets/icons/code-file.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import CopyIcon from 'src/assets/icons/copy.svg';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { Typography } from 'src/components/Typography';
import {
  useAllKubernetesClusterAPIEndpointsQuery,
  useKubenetesKubeConfigQuery,
} from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import copy from 'copy-to-clipboard';
import { CircleProgress } from 'src/components/CircleProgress';

import type { Theme } from '@mui/material/styles';
import { APIError } from '@linode/api-v4';

interface Props {
  clusterId: number;
  clusterLabel: string;
  handleOpenDrawer: () => void;
  isResettingKubeConfig: boolean;
  setResetKubeConfigDialogOpen: (open: boolean) => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
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
    fontFamily: theme.font.bold,
    marginBottom: `calc(${theme.spacing(1)} - 3px)`,
  },
}));

const renderEndpoint = (
  endpoint: null | string | undefined,
  endpointLoading: boolean,
  endpointError?: string
) => {
  if (endpoint) {
    return <MaskableText isToggleable text={endpoint} length="plaintext" />;
  }
  if (endpointLoading) {
    return <Typography>Loading...</Typography>;
  }
  if (endpointError) {
    return <Typography>{endpointError}</Typography>;
  }
  return (
    <Typography>
      Your endpoint will be displayed here once it is available.
    </Typography>
  );
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
  const { classes, cx } = useStyles();

  const { isFetching, refetch: getKubeConfig } = useKubenetesKubeConfigQuery(
    clusterId,
    false
  );

  const onCopyToken = async () => {
    try {
      const { data } = await getKubeConfig();
      const token = data && data.match(/token:\s*(\S+)/);
      if (token && token[1]) {
        copy(token[1]);
      } else {
        enqueueSnackbar({
          message: 'Unable to find token within the Kubeconfig',
          variant: 'error',
        });
      }
    } catch (error) {
      enqueueSnackbar({
        message: (error as APIError[])[0].reason,
        variant: 'error',
      });
    }
  };

  const {
    data: endpoints,
    error: endpointsError,
    isLoading: endpointsLoading,
  } = useAllKubernetesClusterAPIEndpointsQuery(clusterId);

  const downloadKubeConfig = async () => {
    try {
      const { data } = await getKubeConfig();

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
    <Stack spacing={1}>
      <Box>
        <Typography className={classes.label}>
          Kubernetes API Endpoint:
        </Typography>
        {renderEndpoint(
          getEndpointToDisplay(
            endpoints?.map((endpoint) => endpoint.endpoint) ?? []
          ),
          endpointsLoading,
          endpointsError?.[0].reason
        )}
      </Box>
      <Box>
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
            onClick={onCopyToken}
            sx={{ marginLeft: isFetching ? 1.25 : 0 }}
          >
            {isFetching ? (
              <CircleProgress noPadding={true} size="xs" />
            ) : (
              <CopyIcon className={classes.kubeconfigIcons} />
            )}
            <Box
              className={classes.kubeconfigFileText}
              sx={{ marginLeft: isFetching ? 1 : 0 }}
            >
              Copy Token
            </Box>
          </Box>
          <Box
            className={classes.kubeconfigElement}
            onClick={() => setResetKubeConfigDialogOpen(true)}
          >
            <ResetIcon
              className={cx({
                [classes.disabled]: isResettingKubeConfig,
                [classes.kubeconfigIcons]: true,
              })}
            />
            <Typography
              className={cx({
                [classes.disabled]: isResettingKubeConfig,
                [classes.kubeconfigFileText]: true,
              })}
            >
              Reset
            </Typography>
          </Box>
        </div>
      </Box>
    </Stack>
  );
};
