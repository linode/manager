import { CircleProgress } from '@linode/ui';
import { default as TableCell } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from 'react';

import SortUp from 'src/assets/icons/sort-up.svg';
import Sort from 'src/assets/icons/unsorted.svg';

import type { TableCellProps as _TableCellProps } from '@mui/material/TableCell';

export interface TableSortCellProps extends _TableCellProps {
  active: boolean;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
  isLoading?: boolean;
  label: string;
  noWrap?: boolean;
}

export const TableSortCell = (props: TableSortCellProps) => {
  // const { classes, cx } = useStyles();

  const {
    active,
    children,
    direction,
    // eslint-disable-next-line
    handleClick,
    isLoading,
    label,
    noWrap,
    ...rest
  } = props;

  const onHandleClick = () => {
    const { direction, handleClick, label } = props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  return (
    <TableCell
      {...rest}
      sx={{
        whiteSpace: noWrap ? 'nowrap' : '',
      }}
      onClick={onHandleClick}
      role="columnheader"
      sortDirection={direction}
    >
      <TableSortLabel
        IconComponent={SortUp}
        active={active}
        aria-label={`Sort by ${label}`}
        direction={direction}
        hideSortIcon={true}
      >
        {children}
        {!active && <Sort />}
      </TableSortLabel>
      {isLoading && <CircleProgress size="sm" />}
    </TableCell>
  );
};
