import React from 'react';
import { render } from 'react-dom';
import Raven from 'raven-js';
import InternalError from 'linode-components/dist/errors/InternalError';
import ModalShell from 'linode-components/dist/modals/ModalShell';
import { store } from './store';
import { setError } from '~/actions/errors';
import * as session from '~/session';

export default (history) => (e) => {
  Raven.captureException(e);

  try {
    // eslint-disable-next-line no-console
    console.error(e);

    store.dispatch(setError(e));

    // If we hit an error, any future page changes should trigger a full page load.
    const errorPagePathname = window.location.pathname;
    history.listen(function (location) {
      if (location.pathname !== errorPagePathname) {
        session.redirect(location.pathname);
      }
    });

    const ignoreStatuses = [404, 401];
    if (ignoreStatuses.indexOf(e.status) === -1) {
      render(
        <ModalShell
          open
          title={'Oh no! This page is broken.'}
        >
          {/* Yes, we could use window.reload() but we've already got this utility function that
          * can be stubbed out. */}
          <InternalError
            returnHome={() => session.redirect(window.location.pathname)}
          />
        </ModalShell>,
        document.getElementById('emergency-modal')
      );
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  // Needed for react-guard.
  return null;
};
