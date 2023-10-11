import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';
import { truncate } from 'src/utilities/truncate';

import StackScriptSelectionRow from './StackScriptSelectionRow';

interface Props {
  currentUser: string;
  data: StackScript[];
  disabled?: boolean;
  isSorting: boolean;
  onSelect: (s: StackScript) => void;
  publicImages: Record<string, Image>;
  selectedId?: number;
}

export const SelectStackScriptsSection = (props: Props) => {
  const { data, disabled, isSorting, onSelect, selectedId } = props;

  const { data: profile } = useProfile();

  const selectStackScript = (s: StackScript) => (
    <StackScriptSelectionRow
      updated={formatDate(s.updated, {
        displayTime: false,
        timezone: profile?.timezone,
      })}
      checked={selectedId === s.id}
      deploymentsActive={s.deployments_active}
      description={truncate(s.description, 100)}
      disabled={disabled}
      key={s.id}
      label={s.label}
      onSelect={() => onSelect(s)}
      stackScriptID={s.id}
      stackScriptUsername={s.username}
      updateFor={[selectedId === s.id]}
    />
  );

  return (
    <TableBody>
      {!isSorting ? (
        data && data.map(selectStackScript)
      ) : (
        <TableRow>
          <StyledTableCell colSpan={5}>
            <CircleProgress />
          </StyledTableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

export const StyledTableCell = styled(TableCell, { label: 'StyledTableCell' })({
  border: 0,
  paddingTop: 100,
});