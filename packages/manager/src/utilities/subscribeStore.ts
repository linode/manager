import * as moment from 'moment';
import { throttle } from 'throttle-debounce';

import { ApplicationState } from 'src/store';
import { selectiveCopyObject } from 'src/utilities/selectiveCopyObject';

export const loadState = () => {
  try {
    const state = localStorage.getItem('state');
    const updated = localStorage.getItem('state-updated');
    /** Don't load from the cache if it's old data */
    if (updated && moment(updated).diff(moment(), 'days')) {
      return undefined;
    }
    if (state === null) {
      return undefined;
    } else {
      return JSON.parse(state);
    }
  } catch {
    /**
     * If something didn't parse here we should clear out localStorage
     * to be safe
     */
    localStorage.removeItem('state');
    return undefined;
  }
};

const _saveState = (state: ApplicationState) => {
  /**
   * Don't store account/profile/auth data
   * in our cache.
   */
  const _state = selectiveCopyObject(
    [
      '__resources',
      'linodes',
      'linodeConfigs',
      'linodeDisks',
      'volumes',
      'domains',
      'images',
      'kubernetes',
      'nodePools',
      'managed',
      'managedIssues',
      'nodeBalancers',
      'nodeBalancerConfigs',
      'regions',
      'types',
      'clusters',
      'buckets',
      'backups',
      'firewalls',
      'longviewClients',
      'longviewStats',
      // When we recurse, we don't want to store error or loading state information
      'data',
      'entities',
      'items',
      'results',
      'itemsById'
    ],
    state
  );

  try {
    const stringifiedState = JSON.stringify(_state);
    localStorage.setItem('state', stringifiedState);
    localStorage.setItem('state-updated', new Date().toUTCString());
  } catch {
    return;
  }
};

// eslint-disable-next-line
window.addEventListener('unhandledrejection', _ => {
  /**
   * I'm worried that a stale cache could cause the app
   * to crash, and it would be unrecoverable without
   * having the user delete the value manually.
   *
   * @example
   *
   * A user loads Cloud when the error state for an entity
   * uses the older error?: APIError[] format. They then
   * don't use the site for a while, and we update the format
   * to error: { create: undefined }. When they load the app
   * next, the cache is loaded, but attempts to access error.create
   * will crash the app. Reloading the page won't fix this, since
   * we'll just load the cache again.
   *
   * Basically, our philosophy for the Redux cache is that
   * if anything goes wrong at any time, blow out the cache.
   * The fallback--manually requesting everything--is normal
   * behavior and for almost all users is perfectly fast to
   * begin with.
   *
   * If the app crashes, clear out the state from localStorage
   */

  localStorage.removeItem('state');
});

export const saveState = throttle(1000, _saveState);
