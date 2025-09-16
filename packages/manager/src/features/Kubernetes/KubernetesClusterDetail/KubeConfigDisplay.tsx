import { Box, CircleProgress, LinkButton, Stack, Typography } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import DetailsIcon from 'src/assets/icons/code-file.svg';
import CopyIcon from 'src/assets/icons/copy.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import {
  useAllKubernetesClusterAPIEndpointsQuery,
  useKubernetesKubeConfigQuery,
} from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { APIError } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

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
      stroke: theme.tokens.alias.Content.Icon.Primary.Disabled,
    },
    color: theme.tokens.alias.Content.Text.Primary.Disabled,
    pointer: 'default',
    pointerEvents: 'none',
  },
  kubeconfigElement: {
    '&:first-of-type': {
      borderLeft: 'none',
      paddingLeft: 0,
    },
    '&:hover': {
      opacity: 0.7,
      textDecoration: 'none',
    },
    '&:hover:not(:disabled)': {
      textDecoration: 'none',
    },
    alignItems: 'center',
    borderLeft: `1px solid ${theme.tokens.color.Neutrals[40]}`,
    cursor: 'pointer',
    display: 'flex',
    marginBottom: theme.spacing(1),
    padding: `0 ${theme.spacing(0.6)}`,
  },
  kubeconfigElements: {
    alignItems: 'center',
    color: theme.palette.primary.main,
    display: 'flex',
    flexWrap: 'wrap',
  },
  kubeconfigFileText: {
    color: theme.textColors.linkActiveLight,
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  kubeconfigIcons: {
    height: 14,
    margin: `0 ${theme.spacing(1)}`,
    objectFit: 'contain',
    width: 14,
  },
  label: {
    font: theme.font.bold,
    marginBottom: `calc(${theme.spacing(1)} - 3px)`,
  },
}));

const renderEndpoint = (
  endpoint: null | string | undefined,
  endpointLoading: boolean,
  endpointError?: string
) => {
  if (endpoint) {
    return <MaskableText isToggleable length="plaintext" text={endpoint} />;
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

  const { refetch: getKubeConfig } = useKubernetesKubeConfigQuery(
    clusterId,
    false
  );
  const [isCopyTokenLoading, setIsCopyTokenLoading] =
    React.useState<boolean>(false);

  const onCopyToken = async () => {
    try {
      setIsCopyTokenLoading(true);
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
      setIsCopyTokenLoading(false);
    } catch (error) {
      enqueueSnackbar({
        message: (error as APIError[])[0].reason,
        variant: 'error',
      });
      setIsCopyTokenLoading(false);
    }
  };

  const {
    data: endpoints,
    error: endpointsError,
    isLoading: endpointsLoading,
  } = useAllKubernetesClusterAPIEndpointsQuery(clusterId);

  const isClusterReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'lkecluster',
    id: clusterId,
  });

  const downloadKubeConfig = async () => {
    try {
      const queryResult = await getKubeConfig();

      if (
        Array.isArray(queryResult.error) &&
        queryResult.error[0]?.reason?.includes(
          'kubeconfig is not yet available'
        )
      ) {
        enqueueSnackbar(
          'Your cluster is still provisioning. Please try again in a few minutes.',
          { variant: 'error' }
        );
        return;
      }

      if (queryResult.isError) {
        throw queryResult.error;
      }

      if (!queryResult.data) {
        throw new Error('No kubeconfig data available');
      }

      downloadFile(`${clusterLabel}-kubeconfig.yaml`, queryResult.data);
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : getAPIErrorOrDefault(error, 'Unable to download your kubeconfig')[0]
              .reason;

      enqueueSnackbar(errorText, { variant: 'error' });
    }
  };

  const getEndpointToDisplay = (endpoints: string[]) => {
    // We are returning the endpoint with port 443 to be the most user-friendly, but if it doesn't exist, return the first endpoint available
    return (
      endpoints.find((thisResponse) =>
        thisResponse.match(/linodelke\.net:443$/i)
      ) ?? endpoints[0]
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
          <LinkButton
            aria-label={`Download kubeconfig for ${clusterLabel}`}
            className={classes.kubeconfigElement}
            disabled={isClusterReadOnly}
            onClick={downloadKubeConfig}
          >
            <DownloadIcon
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigIcons]: true,
              })}
              style={{ marginLeft: 0 }}
            />
            <Typography
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigFileText]: !isClusterReadOnly,
              })}
            >
              {`${clusterLabel}-kubeconfig.yaml`}
            </Typography>
          </LinkButton>
          <LinkButton
            aria-label="View kubeconfig details"
            className={classes.kubeconfigElement}
            disabled={isClusterReadOnly}
            onClick={handleOpenDrawer}
          >
            <DetailsIcon
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigIcons]: true,
              })}
            />
            <Typography
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigFileText]: !isClusterReadOnly,
              })}
            >
              View
            </Typography>
          </LinkButton>
          <LinkButton
            aria-label="Copy kubeconfig token"
            className={classes.kubeconfigElement}
            disabled={isClusterReadOnly}
            onClick={onCopyToken}
          >
            {isCopyTokenLoading ? (
              <CircleProgress
                className={classes.kubeconfigIcons}
                noPadding
                size="xs"
              />
            ) : (
              <CopyIcon
                className={cx({
                  [classes.disabled]:
                    isResettingKubeConfig || isClusterReadOnly,
                  [classes.kubeconfigIcons]: true,
                })}
              />
            )}
            <Box
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigFileText]: !isClusterReadOnly,
              })}
            >
              Copy Token
            </Box>
          </LinkButton>
          <LinkButton
            aria-label="Reset kubeconfig"
            className={classes.kubeconfigElement}
            disabled={isClusterReadOnly}
            onClick={() => setResetKubeConfigDialogOpen(true)}
          >
            <ResetIcon
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigIcons]: true,
              })}
            />
            <Typography
              className={cx({
                [classes.disabled]: isResettingKubeConfig || isClusterReadOnly,
                [classes.kubeconfigFileText]: !isClusterReadOnly,
              })}
            >
              Reset
            </Typography>
          </LinkButton>
        </div>
      </Box>
    </Stack>
  );
};
