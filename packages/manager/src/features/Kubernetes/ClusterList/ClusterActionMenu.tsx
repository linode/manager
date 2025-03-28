import { getKubeConfig } from '@linode/api-v4/lib/kubernetes';
import { downloadFile } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from '@linode/ui';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { reportException } from 'src/exceptionReporting';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  clusterId: number;
  clusterLabel: string;
  openDialog: () => void;
}

export const ClusterActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const { enqueueSnackbar } = useSnackbar();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { clusterId, clusterLabel, openDialog } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        downloadKubeConfig();
      },
      title: 'Download kubeconfig',
    },
    {
      onClick: () => {
        openDialog();
      },
      title: 'Delete',
    },
  ];

  const downloadKubeConfig = () => {
    getKubeConfig(clusterId)
      .then((response) => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.kubeconfig);
          downloadFile(`${clusterLabel}-kubeconfig.yaml`, decodedFile);
        } catch (e) {
          reportException(e, {
            'Encoded response': response.kubeconfig,
          });
          enqueueSnackbar('Error parsing your kubeconfig file', {
            variant: 'error',
          });
          return;
        }
      })
      .catch((errorResponse) => {
        const error = getErrorStringOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        );
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  return (
    <>
      {!matchesSmDown &&
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <Hidden mdUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Cluster ${props.clusterLabel}`}
        />
      </Hidden>
    </>
  );
};
