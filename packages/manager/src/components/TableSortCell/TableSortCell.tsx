import {
  TableCellProps as _TableCellProps,
  default as TableCell,
} from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import SortUp from 'src/assets/icons/sort-up.svg';
import Sort from 'src/assets/icons/unsorted.svg';
import { CircleProgress } from 'src/components/CircleProgress';

const useStyles = makeStyles()((theme: Theme) => ({
  initialIcon: {
    margin: 0,
    marginLeft: 4,
    marginRight: 4,
  },
  label: {
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    minHeight: 20,
    transition: 'none',
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  root: {
    '& svg': {
      marginLeft: 4,
      width: 20,
    },
    '&:hover': {
      '& .MuiTableSortLabel-icon': {
        color: theme.textColors.linkActiveLight,
      },
      '& span': {
        color: theme.textColors.linkActiveLight,
      },
      '& svg g': {
        fill: theme.textColors.linkActiveLight,
      },
      cursor: 'pointer',
    },
  },
}));

export interface TableSortCellProps extends _TableCellProps {
  active: boolean;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
  isLoading?: boolean;
  label: string;
  noWrap?: boolean;
}

export const TableSortCell = (props: TableSortCellProps) => {
  const { classes, cx } = useStyles();

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
      className={cx(props.className, {
        [classes.noWrap]: noWrap,
        [classes.root]: true,
      })}
      {...rest}
      onClick={onHandleClick}
      role="columnheader"
      sortDirection={direction}
    >
      <TableSortLabel
        IconComponent={SortUp}
        active={active}
        aria-label={`Sort by ${label}`}
        className={classes.label}
        direction={direction}
        hideSortIcon={true}
      >
        {children}
        {!active && <Sort className={classes.initialIcon} />}
      </TableSortLabel>
      {isLoading && <CircleProgress size="sm" />}
    </TableCell>
  );
};
