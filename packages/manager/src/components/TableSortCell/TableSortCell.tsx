import { Theme } from '@mui/material/styles';
import {
  default as TableCell,
  TableCellProps as _TableCellProps,
} from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import * as React from 'react';
import SortUp from 'src/assets/icons/sort-up.svg';
import Sort from 'src/assets/icons/unsorted.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& svg': {
      marginLeft: 4,
      width: 20,
    },
    '&:hover': {
      cursor: 'pointer',
      '& span': {
        color: theme.textColors.linkActiveLight,
      },
      '& .MuiTableSortLabel-icon': {
        color: theme.textColors.linkActiveLight,
      },
      '& svg g': {
        fill: theme.textColors.linkActiveLight,
      },
    },
  },
  label: {
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    minHeight: 20,
    transition: 'none',
  },
  initialIcon: {
    margin: 0,
    marginLeft: 4,
    marginRight: 4,
  },
  noWrap: {
    whiteSpace: 'nowrap',
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
    children,
    direction,
    label,
    active,
    isLoading,
    noWrap,
    // eslint-disable-next-line
    handleClick,
    ...rest
  } = props;

  const onHandleClick = () => {
    const { label, direction, handleClick } = props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  return (
    <TableCell
      className={cx(props.className, {
        [classes.root]: true,
        [classes.noWrap]: noWrap,
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
