import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { getKubeConfig } from 'src/services/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

interface Props {
  clusterId: string;
}

type CombinedProps = Props & WithSnackbarProps;

const ImagesActionMenu: React.FunctionComponent<CombinedProps> = props => {
  const { clusterId, enqueueSnackbar } = props;
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
        }
      ];

      return actions;
    };
  };

  const downloadKubeConfig = () => {
    getKubeConfig(clusterId)
      .then(response => {
        // Convert to utf-8 from base64
        const decodedFile = window.atob(response.kubeconfig);
        downloadFile('kubeconfig.yaml', decodedFile);
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

export default enhanced(ImagesActionMenu);
