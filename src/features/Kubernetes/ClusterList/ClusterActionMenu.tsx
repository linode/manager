import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  clusterId: string;
  downloadKubeConfig: (clusterId: string) => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ImagesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { clusterId, downloadKubeConfig } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Download KubeConfig',
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

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(ImagesActionMenu);
