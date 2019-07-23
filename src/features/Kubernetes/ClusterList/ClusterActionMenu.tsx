import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { reportException } from 'src/exceptionReporting';
import { getKubeConfig } from 'src/services/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface Props {
  clusterId: number;
  openDialog: () => void;
}

type CombinedProps = Props & WithSnackbarProps;

export const ClusterActionMenu: React.FunctionComponent<
  CombinedProps
> = props => {
  const { clusterId, enqueueSnackbar, openDialog } = props;
  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Download kubeconfig',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            downloadKubeConfig();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            openDialog();
            closeMenu();
            e.preventDefault();
          }
        }
      ];

      return actions;
    };
  };

  const downloadKubeConfig = () => {
    getKubeConfig(clusterId)
      .then(response => {
        // Convert to utf-8 from base64
        try {
          const decodedFile = window.atob(response.kubeconfig);
          downloadFile('kubeconfig.yaml', decodedFile);
        } catch (e) {
          reportException(e, {
            'Encoded response': response.kubeconfig
          });
          enqueueSnackbar('Error parsing your kubeconfig file', {
            variant: 'error'
          });
          return;
        }
      })
      .catch(errorResponse => {
        const error = getErrorStringOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        );
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  return <ActionMenu createActions={createActions()} />;
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(ClusterActionMenu);
