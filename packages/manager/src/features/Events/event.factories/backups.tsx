import * as React from 'react';

import type { PartialEventMap } from '../events.factory';

export const backups: PartialEventMap = (e) => ({
  backups_cancel: {
    notification: <>Backups have been canceled for {e.entity!.label}.</>,
  },
  backups_enable: {
    notification: <>Backups have been enabled for {e.entity!.label}.</>,
  },
  backups_restore: {
    // failed: (e) =>
    //   `${formatEventWithAppendedText(
    //     e,
    //     `Backup restoration failed for ${e.entity!.label}.`,
    //     'Learn more about limits and considerations',
    //     'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
    //   )}`,
    finished: <>Backup restoration completed for {e.entity!.label}.</>,
    notification: <>Backup restoration completed for {e.entity!.label}.</>,
    scheduled: <>Backup restoration scheduled for {e.entity!.label}</>,
    started: <>Backup restoration started for {e.entity!.label}</>,
  },
});
