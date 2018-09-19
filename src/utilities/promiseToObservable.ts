import { Observable } from 'rxjs';

/**
 * This function will transform a given promise into an observable
 * but also cancel the previous inner observable in favor of the new one
 * 
 * This lets us prevent overlapping network requests from occuring
 * 
 * learn more about switchMap:
 * https://www.learnrxjs.io/operators/transformation/switchmap.html
 * 
 * Exmaple usage:
 * 
 * transformPromiseToCancellableObservable(getLinodes)
 *      .subscribe(
 *          () => console.log('onSuccess'),
 *          () => console.log('onFailure),
 *          () => console.log('onComletion')
 *       )
 * @param promiseFn a function that returns a promise (i.e )
 */
const transformPromiseToCancellableObservable = (promiseFn: () => Promise<any>) => {
  return Observable
    /** convert promise to observable */
    .fromPromise(promiseFn())
    /** cancel previous subscribed request in favor of the new one */
    .switchMap(() => promiseFn())
}

export default transformPromiseToCancellableObservable;