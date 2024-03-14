import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import { RenderLinodeProps } from './SelectLinodePanel';
import {
  SelectLinodeRow,
  SelectLinodeTableRowHead,
  numCols,
} from './SelectLinodeRow';
export const SelectLinodeTable = ({
  disabled,
  handlePowerOff,
  handleSelection,
  orderBy,
  selectedLinodeId,
  showPowerActions,
}: RenderLinodeProps) => {
  const isLinodesGrantReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: selectedLinodeId,
  });
  return (
    <Table aria-label="Linode" size="small">
      <TableHead style={{ fontSize: '.875rem' }}>
        <SelectLinodeTableRowHead
          orderBy={orderBy}
          showPowerActions={showPowerActions}
        />
      </TableHead>
      <TableBody role="radiogroup">
        {orderBy.data.length > 0 ? (
          orderBy.data.map((linode) => (
            <SelectLinodeRow
              handleSelection={() =>
                handleSelection(linode.id, linode.type, linode.specs.disk)
              }
              selected={
                !isLinodesGrantReadOnly &&
                !disabled &&
                Number(selectedLinodeId) === linode.id
              }
              disabled={disabled}
              handlePowerOff={() => handlePowerOff(linode.id)}
              key={linode.id}
              linode={linode}
              showPowerActions={showPowerActions}
            />
          ))
        ) : (
          <TableRowEmpty colSpan={numCols} message={'No results'} />
        )}
      </TableBody>
    </Table>
  );
};
