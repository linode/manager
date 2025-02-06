import * as React from 'react';

import { StyledTableRow } from './TableRow.styles';

import type { TableRowOwnProps } from '@mui/material';
import type { TableRowProps as _TableRowProps } from '@mui/material/TableRow';

export interface TableRowProps extends _TableRowProps {
  className?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  hover?: TableRowOwnProps['hover'];
  htmlFor?: string;
  onKeyUp?: any;
  selected?: boolean;
}

export const TableRow = React.memo((props: TableRowProps) => {
  const { domRef, hover = true, selected, ...rest } = props;

  return (
    <StyledTableRow hover={hover} ref={domRef} selected={selected} {...rest}>
      {props.children}
    </StyledTableRow>
  );
});
