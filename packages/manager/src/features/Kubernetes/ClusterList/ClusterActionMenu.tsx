import { getKubeConfig } from '@linode/api-v4/lib/kubernetes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import Hidden from 'src/components/core/Hidden';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { reportException } from 'src/exceptionReporting';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface Props {
  clusterId: number;
  clusterLabel: string;
  openDialog: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithSnackbarProps;

export const ClusterActionMenu: React.FunctionComponent<CombinedProps> = (
  props
) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { clusterId, clusterLabel, enqueueSnackbar, openDialog } = props;

  const actions: Action[] = [
    {
      title: 'Download kubeconfig',
      onClick: () => {
        downloadKubeConfig();
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        openDialog();
      },
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
              key={action.title}
              actionText={action.title}
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

const enhanced = compose<CombinedProps, Props>(withSnackbar, withRouter);

export default enhanced(ClusterActionMenu);
