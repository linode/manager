import * as React from 'react';

import type { PartialEventMap } from '../types';

export const lassie: PartialEventMap<'lassie'> = {
  lassie_reboot: {
    failed: (e) => (
      <>
        Linode {e.entity?.label} could <strong>not</strong> be{' '}
        <strong>booted</strong> by the Lassie watchdog service.
      </>
    ),
    finished: (e) => (
      <>
        Linode {e.entity?.label} has been <strong>booted</strong> by the Lassie
        watchdog service.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode {e.entity?.label} is scheduled to be <strong>rebooted</strong> by
        the Lassie watchdog service.
      </>
    ),
    started: (e) => (
      <>
        Linode {e.entity?.label} is being <strong>booted</strong> by the Lassie
        watchdog service.
      </>
    ),
  },
};
