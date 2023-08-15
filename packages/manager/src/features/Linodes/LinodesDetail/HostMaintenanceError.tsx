import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

export const HostMaintenanceError = () => (
  <Notice
    variant="warning"
    text="This action is unavailable while your Linode&rsquo;s host is undergoing maintenance."
  />
);
