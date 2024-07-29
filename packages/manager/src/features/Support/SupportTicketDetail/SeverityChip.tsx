import React from 'react';

import { Chip } from 'src/components/Chip';

import { SEVERITY_LABEL_MAP } from '../SupportTickets/constants';

import type { TicketSeverity } from '@linode/api-v4';
import type { ChipProps } from 'src/components/Chip';

const severityColorMap: Record<TicketSeverity, ChipProps['color']> = {
  1: 'error',
  2: 'warning',
  3: 'info',
};

export const SeverityChip = ({ severity }: { severity: TicketSeverity }) => (
  <Chip
    color={severityColorMap[severity]}
    label={SEVERITY_LABEL_MAP.get(severity)}
    sx={(theme) => ({ padding: theme.spacing() })}
  />
);
