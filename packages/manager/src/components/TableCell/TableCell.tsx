import { TooltipIcon } from '@linode/ui';
import { Box } from '@linode/ui';
import { default as _TableCell } from '@mui/material/TableCell';
import * as React from 'react';

import type { TableCellProps as _TableCellProps } from '@mui/material/TableCell';

export interface TableCellProps extends _TableCellProps {
  actionCell?: boolean;
  center?: boolean;
  className?: string;
  compact?: boolean;
  errorCell?: boolean;
  errorText?: string;
  noWrap?: boolean;
  statusCell?: boolean;
}

export const TableCell = (props: TableCellProps) => {
  const {
    actionCell,
    center,
    className,
    errorCell,
    errorText,
    noWrap,
    statusCell,
    ...rest
  } = props;

  return (
    <_TableCell
      sx={{
        paddingRight: actionCell ? 0 : '',
        textAlign: actionCell ? 'right' : center ? 'center' : '',
        textTransform: statusCell ? 'capitalize' : '',
        whiteSpace: noWrap ? 'nowrap' : '',
      }}
      className={className}
      {...rest}
    >
      {statusCell ? (
        <Box alignItems="center" display="flex">
          {props.children}
        </Box>
      ) : errorCell && errorText ? (
        <>
          {props.children}
          <TooltipIcon
            status="error"
            style={{ paddingBottom: 0, paddingTop: 0 }}
            text={errorText}
          />
        </>
      ) : (
        props.children
      )}
    </_TableCell>
  );
};
