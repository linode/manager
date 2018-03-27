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

export const rebootLinode = (
  linodeID: string | number,
  linodeLabel: string,
) => {
  Axios.post(`${API_ROOT}/linode/instances/${linodeID}/reboot`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_reboot', linodeID, linodeLabel));
    resetEventsPolling();
  });
};

export const powerOffLinode = (
  linodeID: string | number,
  linodeLabel: string,
) => {
  Axios.post(`${API_ROOT}/linode/instances/${linodeID}/shutdown`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_shutdown', linodeID, linodeLabel));
    resetEventsPolling();
  });
};

export const powerOnLinode = (
  linodeID: string | number,
  linodeLabel: string,
) => {
  Axios.post(`${API_ROOT}/linode/instances/${linodeID}/boot`)
  .then((response) => {
    linodeEvents$.next(genEvent('linode_boot', linodeID, linodeLabel));
    resetEventsPolling();
  });
};
