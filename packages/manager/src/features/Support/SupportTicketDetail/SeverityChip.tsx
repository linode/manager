import { TicketSeverity } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Chip, ChipProps } from 'src/components/Chip';

import { severityLabelMap } from '../SupportTickets/ticketUtils';

const severityColorMap: Record<TicketSeverity, ChipProps['color']> = {
  1: 'error',
  2: 'warning',
  3: 'info',
};

export const SeverityChip = ({ severity }: { severity: TicketSeverity }) => (
  <StyledChip
    color={severityColorMap[severity]}
    label={severityLabelMap.get(severity)}
  />
);

const StyledChip = styled(Chip, { label: 'StyledChip' })(({ theme }) => ({
  paddingLeft: theme.spacing(),
  paddingRight: theme.spacing(),
}));
