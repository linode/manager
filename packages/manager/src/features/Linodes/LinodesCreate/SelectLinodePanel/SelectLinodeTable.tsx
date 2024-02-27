import React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

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
}: RenderLinodeProps) => (
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
            disabled={disabled}
            handlePowerOff={() => handlePowerOff(linode.id)}
            key={linode.id}
            linodeId={linode.id}
            selected={Number(selectedLinodeId) === linode.id}
            showPowerActions={showPowerActions}
          />
        ))
      ) : (
        <TableRowEmpty colSpan={numCols} message={'No results'} />
      )}
    </TableBody>
  </Table>
);
