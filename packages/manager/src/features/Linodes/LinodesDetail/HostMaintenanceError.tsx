import * as React from 'react';
import { Notice } from 'src/components/Notice/Notice';

export const HostMaintenanceError = () => (
  <Notice
    warning
    text="This action is unavailable while your Linode&rsquo;s host is undergoing maintenance."
  />
);
