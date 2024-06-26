import { TableRowProps as _TableRowProps } from '@mui/material/TableRow';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';

import { StyledTableDataCell, StyledTableRow } from './TableRow.styles';

export interface TableRowProps extends _TableRowProps {
  className?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  highlight?: boolean;
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
          <StyledTableDataCell />
        </Hidden>
      )}
    </StyledTableRow>
  );
});
