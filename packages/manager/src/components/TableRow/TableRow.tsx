import * as React from 'react';

import { Hidden } from 'src/components/Hidden';

import { StyledTableDataCell, StyledTableRow } from './TableRow.styles';

import type { TableRowProps as _TableRowProps } from '@mui/material/TableRow';

export interface TableRowProps extends _TableRowProps {
  className?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  htmlFor?: string;
  onKeyUp?: any;
  selected?: boolean;
}

export const TableRow = React.memo((props: TableRowProps) => {
  const { domRef, selected, ...rest } = props;

  return (
    <StyledTableRow ref={domRef} selected={selected} {...rest}>
      {props.children}
      {selected && (
        <Hidden lgDown>
          {/* This is used only in Longview */}
          <StyledTableDataCell />
        </Hidden>
      )}
    </StyledTableRow>
  );
});
