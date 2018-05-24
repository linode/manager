import { getNotifications } from 'src/services/account';
import { ReplaySubject } from 'rxjs/ReplaySubject';

getNotifications()
  .then(response => notifications$.next(response.data))
  .catch(errorResponse => notifications$.error(errorResponse));

const notifications$ = new ReplaySubject<Linode.Notification[]>();

export default notifications$;
