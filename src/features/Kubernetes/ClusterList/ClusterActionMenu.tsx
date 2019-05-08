import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { getKubeConfig } from 'src/services/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';

interface Props {
  clusterId: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const downloadKubeConfig = (clusterId: string) => {
  getKubeConfig(clusterId)
    .then(response => {
      // Convert to utf-8 from base64
      const decodedFile = window.atob(response.kubeconfig);
      downloadFile('kubeconfig.yaml', decodedFile);
    })
    .catch(errorResponse => console.error(errorResponse));
};

const ImagesActionMenu: React.FunctionComponent<CombinedProps> = props => {
  const { clusterId } = props;
  const createActions = () => {
    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Download kubeconfig',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            downloadKubeConfig(clusterId);
            closeMenu();
            e.preventDefault();
          }
        }
      ];

      return actions;
    };
  };

  return <ActionMenu createActions={createActions()} />;
};

export default withRouter(ImagesActionMenu);
