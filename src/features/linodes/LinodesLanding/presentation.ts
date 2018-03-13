import Axios from 'axios';

import { API_ROOT } from 'src/constants';
import { resetEventsPolling } from 'src/events';

import { Action } from 'src/components/ActionMenu';

function titlecase(string: string): string {
  return `${string.substr(0, 1).toUpperCase()}${string.substr(1)}`;
}

export function formatRegion(region: string) {
  const [countryCode, area] = region.split('-');
  return `${countryCode.toUpperCase()} ${titlecase(area)}`;
}

export function typeLabelLong(memory?: number, disk?: number, cpus?: number) {
  if (!memory || !disk || !cpus) { return; }
  const memG = memory / 1024;
  const diskG = disk / 1024;
  return `Linode ${memG}G: ${cpus} CPU, ${diskG}G Storage, ${memG}G RAM`;
}

export function typeLabel(memory?: number) {
  if (!memory) { return; }
  return `Linode ${memory / 1024}G`;
}

export function displayLabel(memory?: number): string | undefined {
  if (!memory) { return; }
  return `${typeLabel(memory)}`;
}

export const createLinodeActions = (linode: Linode.Linode) =>
  (push: Function, closeMenu: Function): Action[] => {
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
