import { Notice } from '@linode/ui';
import * as React from 'react';

export const HostMaintenanceError = () => (
  <Notice
    text="This action is unavailable while your Linode&rsquo;s host is undergoing maintenance."
    variant="warning"
  />
);
