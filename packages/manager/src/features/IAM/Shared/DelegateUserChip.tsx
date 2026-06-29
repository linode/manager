import { Badge } from '@akamai/cds-components/react';
import * as React from 'react';

import { useBreakpoint } from '../hooks/useBreakpoint';

interface Props {
  // When true, hide the chip on screens smaller than 'sm'
  hideBelowSm?: boolean;
}

export const DelegateUserChip = ({ hideBelowSm = false }: Props) => {
  const isSmDown = useBreakpoint('down', 'sm');
  return (
    <span style={{ display: hideBelowSm && isSmDown ? 'none' : undefined }}>
      <Badge
        color="ultramarine"
        style={{ textTransform: 'uppercase' }}
        variant="subtle"
      >
        delegate user
      </Badge>
    </span>
  );
};
