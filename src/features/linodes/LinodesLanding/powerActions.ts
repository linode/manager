import * as moment from 'moment';

import { events$, resetEventsPolling } from 'src/events';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import {
  getLinodeConfigs,
  linodeBoot,
  linodeReboot,
  linodeShutdown
} from 'src/services/linodes';
import { dateFormat } from 'src/time';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export const genEvent = (
  action: string,
  linodeID: string | number,
  linodeLabel: string
) => {
  return {
    read: false,
    rate: null,
    time_remaining: null,
    created: moment.utc().format(dateFormat),
    action,
    status: 'scheduled',
    id: 1 /* NB: fake but valid Event ID */,
    percent_complete: 0,
    seen: false,
    entity: {
      url: `/v4/linode/instances/${linodeID}`,
      label: `${linodeLabel}`,
      type: 'linode',
      id: linodeID
    },
    username: ''
  } as Linode.Event;
};

export type LinodePowerAction = (
  id: string | number,
  label: string,
  config_id?: number,
  sendToast?: (message: string, toastOptions: any) => void
) => void;

const _rebootLinode: LinodePowerAction = (id, label, config_id, sendToast) => {
  linodeReboot(id, config_id)
    .then(_ => {
      events$.next(genEvent('linode_reboot', id, label));
      resetEventsPolling();
    })
    .catch(err => {
      const errors = getAPIErrorOrDefault(
        err,
        'There was an issue rebooting your Linode'
      );
      errors.forEach(
        e =>
          sendToast &&
          sendToast(e.reason, {
            variant: 'error'
          })
      );
    });
};

const _powerOnLinode: LinodePowerAction = (id, label, configId) => {
  linodeBoot(id, configId).then(response => {
    events$.next(genEvent('linode_boot', id, label));
    resetEventsPolling();
  });
};

type DrawerFunction = (
  configs: Linode.Config[],
  action: LinodeConfigSelectionDrawerCallback
) => void;

const withAction = (action: LinodePowerAction) => (
  updateDrawer: DrawerFunction,
  id: number,
  label: string,
  sendToast?: (message: string, toastOptions: any) => void
) => {
  getLinodeConfigs(id)
    .then((response: Linode.ResourcePage<Linode.Config>) => {
      const configs = response.data;
      const len = configs.length;

      if (len > 1) {
        updateDrawer(configs, config_id =>
          action(id, label, config_id, sendToast)
        );
      } else {
        action(id, label, undefined, sendToast);
      }
    })
    .catch(e => {
      if (!!sendToast) {
        sendToast('There was an issue taking action on this Linode', {
          variant: 'error'
        });
      }
    });
};

export const powerOffLinode: LinodePowerAction = (id, label) => {
  linodeShutdown(id).then(response => {
    events$.next(genEvent('linode_shutdown', id, label));
    resetEventsPolling();
  });
};

export const rebootLinode = withAction(_rebootLinode);

export const powerOnLinode = withAction(_powerOnLinode);
