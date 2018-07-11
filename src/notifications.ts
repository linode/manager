import { ReplaySubject } from 'rxjs/ReplaySubject';

import { getNotifications } from 'src/services/account';

getNotifications()
  .then(response => notifications$.next(response.data))
  .catch(errorResponse => notifications$.error(errorResponse));

const notifications$ = new ReplaySubject<Linode.Notification[]>();

export default notifications$;
