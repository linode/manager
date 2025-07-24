import { CircleProgress } from '@linode/ui';
import { default as TableCell } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from 'react';

import ArrowDown from 'src/assets/icons/arrow-down.svg';
import Sort from 'src/assets/icons/unsorted.svg';

import type { TableCellProps as _TableCellProps } from '@mui/material/TableCell';

export interface TableSortCellProps extends _TableCellProps {
  active: boolean;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
  iconSlot?: React.ReactNode;
  isLoading?: boolean;
  label: string;
  noWrap?: boolean;
}

export const TableSortCell = (props: TableSortCellProps) => {
  const {
    active,
    children,
    direction,
    // eslint-disable-next-line
    handleClick,
    iconSlot,
    isLoading,
    label,
    noWrap,
    sx,
    ...rest
  } = props;

  const ariaSort =
    active && direction === 'asc'
      ? 'ascending'
      : active && direction === 'desc'
        ? 'descending'
        : 'none';

  const onHandleClick = () => {
    const { direction, handleClick, label } = props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  return (
    <TableCell
      aria-sort={ariaSort}
      onClick={onHandleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onHandleClick();
        }
      }}
      role="columnheader"
      sortDirection={direction}
      sx={{
        whiteSpace: noWrap ? 'nowrap' : '',
        ...sx,
      }}
      {...rest}
    >
      <TableSortLabel
        active={active}
        aria-label={`Sort by ${label}`}
        direction={direction}
        hideSortIcon={true}
        IconComponent={ArrowDown}
      >
        {children}
        {!active && <Sort />}
      </TableSortLabel>
      {iconSlot}
      {isLoading && <CircleProgress size="sm" />}
    </TableCell>
  );
};
