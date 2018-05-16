import { getNotifications } from 'src/services/account';
import { Observable } from 'rxjs/Rx';

const notifications$: Observable<Linode.Notification[]> =
  Observable.defer(() => getNotifications()
    .then(response => response.data),
  );

export default notifications$;
