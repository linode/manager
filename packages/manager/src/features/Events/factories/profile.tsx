import * as React from 'react';

import type { PartialEventMap } from '../types';

export const profile: PartialEventMap<'profile'> = {
  profile_update: {
    notification: (e) => (
      <>
        Your profile has been <strong>updated</strong>.
      </>
    ),
  },
};
