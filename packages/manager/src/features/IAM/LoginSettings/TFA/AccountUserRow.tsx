import { Checkbox, TableCell, TableRow } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';

interface Props {
  checked: boolean;
  email?: string;
  onToggle: (checked: boolean) => void;
  username: string;
}

export const AccountUserRow = ({
  checked,
  email,
  onToggle,
  username,
}: Props) => {
  const isSmUp = useBreakpoint('up', 'sm');

  return (
    <TableRow
      hoverable
      onClick={(e: React.MouseEvent) => {
        const t = e.target as Element;
        if (t.closest?.('cds-checkbox')) return;
        onToggle(!checked);
      }}
      rowborder
      selected={checked}
      zebra
    >
      <TableCell style={{ minWidth: '3%', paddingLeft: 0, maxWidth: '7%' }}>
        <Checkbox
          checked={checked}
          data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.selectSingleUser}
          onChange={(e) => onToggle(Boolean(e.detail))}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          size="small"
          style={{ marginLeft: `-${Spacing.S12}` }}
        />
      </TableCell>
      <TableCell style={{ minWidth: '37%' }}>{username}</TableCell>
      {isSmUp && <TableCell style={{ minWidth: '60%' }}>{email}</TableCell>}
    </TableRow>
  );
};
