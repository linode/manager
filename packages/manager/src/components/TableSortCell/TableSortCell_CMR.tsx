import * as React from 'react';
import SortUp from 'src/assets/icons/sort-up.svg';
import Sort from 'src/assets/icons/unsorted.svg';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';
import TableSortLabel from 'src/components/core/TableSortLabel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none',
    '&:hover': {
      backgroundColor: '#3683dc',
      cursor: 'pointer',
      '& span': {
        color: theme.color.white
      },
      '& .MuiTableSortLabel-icon': {
        color: `${theme.color.white} !important`
      },
      '& svg g': {
        fill: theme.color.white
      }
    }
  },
  label: {
    color: theme.palette.text.primary,
    minHeight: 20,
    transition: 'none'
  },
  initialIcon: {
    margin: '2px 4px 0 5px'
  },
  noWrap: {
    whiteSpace: 'nowrap'
  }
}));

export interface Props extends TableCellProps {
  active: boolean;
  isLoading?: boolean;
  label: string;
  direction: 'asc' | 'desc';
  handleClick: (key: string, order?: 'asc' | 'desc') => void;
  noWrap?: boolean;
}

type CombinedProps = Props;

export const TableSortCell: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { children, direction, label, active, isLoading, ...rest } = props;

  const onHandleClick = () => {
    const { label, direction, handleClick } = props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  return (
    <TableCell
      className={classes.root}
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
      {isLoading && <CircleProgress mini sort />}
    </TableCell>
  );
};

export default TableSortCell;
