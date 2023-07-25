import 'rxjs/add/operator/switchMap';
import { fromPromise } from 'rxjs/observable/fromPromise';

/**
 * This function will transform a given promise into an observable
 * but also cancel the previous inner observable in favor of the new one
 *
 * This lets us prevent overlapping network requests from occurring
 *
 * learn more about switchMap:
 * https://www.learnrxjs.io/operators/transformation/switchmap.html
 *
 * Example usage:
 *
 * transformPromiseToCancellableObservable(getLinodes)
 *      .subscribe(
 *          () => console.log('onSuccess'),
 *          () => console.log('onFailure),
 *          () => console.log('onCompletion')
 *       )
 * @param promiseFn a function that returns a promise (i.e )
 */
const transformPromiseToCancellableObservable = (
  promiseFn: () => Promise<any>
) => {
  return (
    fromPromise(promiseFn())
      /** cancel previous subscribed request in favor of the new one */
      .switchMap(() => promiseFn())
  );
};

export default transformPromiseToCancellableObservable;
