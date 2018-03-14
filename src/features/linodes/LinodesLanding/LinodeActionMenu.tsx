import * as React from 'react';
import Axios from 'axios';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { API_ROOT } from 'src/constants';
import { resetEventsPolling } from 'src/events';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  linode: Linode.Linode;
}

type FinalProps = Props & RouteComponentProps<{}>;

class LinodeActionMenu extends React.Component<FinalProps> {
  createLinodeActions() {
    const { linode, history: { push } } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Launch Console',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/glish`);
            e.preventDefault();
          },
        },
        {
          title: 'Reboot',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            Axios.post(`${API_ROOT}/linode/instances/${linode.id}/reboot`)
            .then((response) => {
              resetEventsPolling();
            });
            closeMenu();
            // TODO, catch errors and show them with a snackbar
          },
        },
        {
          title: 'View Graphs',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/summary`);
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/resize`);
            e.preventDefault();
          },
        },
        {
          title: 'View Backups',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/backups`);
            e.preventDefault();
          },
        },
        {
          title: 'Settings',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            push(`/linodes/${linode.id}/settings`);
            e.preventDefault();
          },
        },
      ];

      if (linode.status === 'offline') {
        actions.unshift({
          title: 'Power On',
          onClick: (e) => {
            Axios.post(`${API_ROOT}/linode/instances/${linode.id}/boot`)
            .then((response) => {
              resetEventsPolling();
            });
            closeMenu();
            // TODO, catch errors and show them with a snackbar
          },
        });
      }

      if (linode.status === 'running') {
        actions.unshift({
          title: 'Power Off',
          onClick: (e) => {
            Axios.post(`${API_ROOT}/linode/instances/${linode.id}/shutdown`)
            .then((response) => {
              resetEventsPolling();
            });
            closeMenu();
            // TODO, catch errors and show them with a snackbar
          },
        });
      }

      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createLinodeActions()} />
    );
  }
}

export default withRouter(LinodeActionMenu);
