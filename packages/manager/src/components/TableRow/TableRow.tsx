import * as React from 'react';
import { Hidden } from 'src/components/Hidden';
import { TableRowProps as _TableRowProps } from '@mui/material/TableRow';
import {
  StyledTableRow,
  StyledTableDataCell,
  StyledActiveCaret,
  StyledActiveCaretOverlay,
} from './TableRow.styles';

export interface TableRowProps extends _TableRowProps {
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  domRef?: any;
  forceIndex?: boolean;
  highlight?: boolean;
  htmlFor?: string;
  onKeyUp?: any;
  selected?: boolean;
}

export const TableRow = React.memo((props: TableRowProps) => {
  const { ariaLabel, domRef, selected, ...rest } = props;

  return (
    <StyledTableRow
      aria-label={ariaLabel ?? `View Details`}
      ref={domRef}
      {...rest}
    >
      {props.children}
      {selected && (
        <Hidden lgDown>
          <StyledTableDataCell>
            <StyledActiveCaret />
            <StyledActiveCaretOverlay />
          </StyledTableDataCell>
        </Hidden>
      )}
    </StyledTableRow>
  );
});
