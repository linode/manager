import { getKubeConfig } from '@linode/api-v4/lib/kubernetes';
import { Hidden } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { reportException } from 'src/exceptionReporting';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';
import type { ActionType } from 'src/features/Account/utils';

interface Props {
  clusterId: number;
  clusterLabel: string;
  disabled?: boolean;
  openDialog: () => void;
}

export const ClusterActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const { enqueueSnackbar } = useSnackbar();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { clusterId, clusterLabel, disabled, openDialog } = props;

  const getTooltipText = (action: ActionType) => {
    return disabled
      ? getRestrictedResourceText({
          action,
          isSingular: true,
          resourceType: 'LKE Clusters',
        })
      : undefined;
  };

  const actions: Action[] = [
    {
      onClick: () => {
        downloadKubeConfig();
      },
      disabled,
      title: 'Download kubeconfig',
      tooltip: getTooltipText('download'),
    },
    {
      onClick: () => {
        openDialog();
      },
      disabled,
      title: 'Delete',
      tooltip: getTooltipText('delete'),
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
              disabled={disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
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
