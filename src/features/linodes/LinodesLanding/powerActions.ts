import Axios from 'axios';

import { API_ROOT } from 'src/constants';
import { resetEventsPolling } from 'src/events';

export const rebootLinode = (linodeID: string) => {
  Axios.post(`${API_ROOT}/linode/instances/${linodeID}/reboot`)
  .then((response) => {
    resetEventsPolling();
  });
  // TODO, catch errors and show them with a snackbar
};
