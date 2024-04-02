import { TicketSeverity } from '@linode/api-v4';
import React from 'react';

import { Chip, ChipProps } from 'src/components/Chip';

import { severityLabelMap } from '../SupportTickets/ticketUtils';

const severityColorMap: Record<TicketSeverity, ChipProps['color']> = {
  1: 'error',
  2: 'warning',
  3: 'info',
};

export const SeverityChip = ({ severity }: { severity: TicketSeverity }) => (
  <Chip
    color={severityColorMap[severity]}
    label={severityLabelMap.get(severity)}
    sx={(theme) => ({ padding: theme.spacing() })}
  />
);
