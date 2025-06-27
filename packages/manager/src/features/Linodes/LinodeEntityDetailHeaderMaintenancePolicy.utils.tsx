import {
  LoadFailureIcon as MaintenanceActiveIcon,
  CalendarIcon as MaintenancePendingIcon,
  CalendarScheduledIcon as MaintenanceScheduledIcon,
} from '@linode/ui';
import * as React from 'react';

export const statusTooltipIcons = {
  scheduled: <MaintenanceScheduledIcon />,
  active: <MaintenanceActiveIcon />,
  pending: <MaintenancePendingIcon />,
} as const;
