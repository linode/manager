import * as React from 'react';
import SortUp from 'src/assets/icons/sort-up.svg';
import Sort from 'src/assets/icons/unsorted.svg';
import TableSortLabel from '@mui/material/TableSortLabel';
import { CircleProgress } from 'src/components/CircleProgress';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import {
  default as TableCell,
  TableCellProps as _TableCellProps,
} from '@mui/material/TableCell';

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
  isLoading?: boolean;
  label: string;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
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
      sortDirection={direction}
      role="columnheader"
      onClick={onHandleClick}
    >
      <TableSortLabel
        active={active}
        direction={direction}
        className={classes.label}
        IconComponent={SortUp}
        hideSortIcon={true}
        aria-label={`Sort by ${label}`}
      >
        {children}
        {!active && <Sort className={classes.initialIcon} />}
      </TableSortLabel>
      {isLoading && <CircleProgress mini />}
    </TableCell>
  );
};
