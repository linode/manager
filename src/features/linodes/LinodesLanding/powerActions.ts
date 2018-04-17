import Axios from 'axios';
import * as moment from 'moment';

import { API_ROOT } from 'src/constants';
import { events$, resetEventsPolling } from 'src/events';

import { dateFormat } from 'src/time';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { getLinodeConfigs } from 'src/services/linode';

export const genEvent = (
  action: string,
  linodeID: string | number,
  linodeLabel: string,
) => {
  return {
    read: false,
    rate: null,
    time_remaining: null,
    created: moment.utc().format(dateFormat),
    action,
    status: 'scheduled',
    id: 1, /* NB: fake but valid Event ID */
    percent_complete: 0,
    seen: false,
    entity: {
      url: `/v4/linode/instances/${linodeID}`,
      label: `${linodeLabel}`,
      type: 'linode',
      id: linodeID,
    },
    username: '',
  } as Linode.Event;
};

export interface LinodePowerAction {
  (id: string | number, label: string, config_id?: number): void;
}

const _rebootLinode: LinodePowerAction = (id, label, config_id) => {
  Axios.post(`${API_ROOT}/linode/instances/${id}/reboot`, { config_id })
  .then((response) => {
    events$.next(genEvent('linode_reboot', id, label));
    resetEventsPolling();
  });
};

const _powerOnLinode: LinodePowerAction = (id, label) => {
  Axios.post(`${API_ROOT}/linode/instances/${id}/boot`)
  .then((response) => {
    events$.next(genEvent('linode_boot', id, label));
    resetEventsPolling();
  });
};

interface DrawerFunction {
  (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback): void;
}

const withAction = (
  action: LinodePowerAction,
) => (
  updateDrawer: DrawerFunction,
  id: number,
  label: string,
) => {
  getLinodeConfigs(id)
    .then((response: Linode.ManyResourceState<Linode.Config>) => {
      const configs = response.data;
      const len = configs.length;

      if (len > 1) {
        updateDrawer(configs, config_id => action(id, label, config_id));
      } else {
        action(id, label);
      }
    });
};

export const powerOffLinode: LinodePowerAction = (id, label) => {
  Axios.post(`${API_ROOT}/linode/instances/${id}/shutdown`)
  .then((response) => {
    events$.next(genEvent('linode_shutdown', id, label));
    resetEventsPolling();
  });
};

export const rebootLinode = withAction(_rebootLinode);

export const powerOnLinode = withAction(_powerOnLinode);
