import Axios from 'axios';
import { Observable } from 'rxjs/Rx';

import { API_ROOT } from 'src/constants';

const getNotifications = Axios.get(`${API_ROOT}/account/notifications`)
  .then(response => response.data.data);

const notifications$: Observable<Linode.Notification[]> =
  Observable.defer(() => getNotifications);

export default notifications$;
