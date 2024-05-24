import * as React from 'react';

import type { PartialEventMap } from '../events.factory';

export const backups: PartialEventMap = {
  backups_cancel: {
    notification: (e) => <>Backups have been canceled for {e.entity!.label}.</>,
  },
  backups_enable: {
    notification: (e) => <>Backups have been enabled for {e.entity!.label}.</>,
  },
  backups_restore: {
    // failed: (e) =>
    //   `${formatEventWithAppendedText(
    //     e,
    //     `Backup restoration failed for ${e.entity!.label}.`,
    //     'Learn more about limits and considerations',
    //     'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
    //   )}`,
    failed: (e) => <>Backup restoration failed for {e.entity!.label}.</>,
    finished: (e) => <>Backup restoration completed for {e.entity!.label}.</>,
    notification: (e) => (
      <>Backup restoration completed for {e.entity!.label}.</>
    ),
    scheduled: (e) => <>Backup restoration scheduled for {e.entity!.label}</>,
    started: (e) => <>Backup restoration started for {e.entity!.label}</>,
  },
};
