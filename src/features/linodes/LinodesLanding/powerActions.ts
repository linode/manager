import Axios from 'axios';

import { API_ROOT } from 'src/constants';
import { linodeEvents$, resetEventsPolling } from 'src/events';
import * as moment from 'moment';

const dateFormat = 'YYYY-MM-DDTHH:mm:ss';

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
  } as Linode.Event;
};

export const rebootLinode = (linode: Linode.Linode) => {
  Axios.post(`${API_ROOT}/linode/instances/${linode.id}/reboot`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_reboot', linode.id, linode.label));
    resetEventsPolling();
  });
};

export const powerOffLinode = (linode: Linode.Linode) => {
  Axios.post(`${API_ROOT}/linode/instances/${linode.id}/shutdown`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_shutdown', linode.id, linode.label));
    resetEventsPolling();
  });
};

export const powerOnLinode = (linode: Linode.Linode) => {
  Axios.post(`${API_ROOT}/linode/instances/${linode.id}/boot`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_boot', linode.id, linode.label));
    resetEventsPolling();
  });
};
