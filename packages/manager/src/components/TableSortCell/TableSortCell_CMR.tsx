import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';
import TableSortLabel from 'src/components/core/TableSortLabel';

import Sort from 'src/assets/icons/sort.svg';
import SortUp from 'src/assets/icons/sortUp.svg';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    color: theme.palette.text.primary,
    minHeight: 20
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

  const {
    children,
    direction,
    label,
    active,
    handleClick,
    noWrap,
    isLoading,
    ...rest
  } = props;

  const onHandleClick = () => {
    const { label, direction, handleClick } = props;
    const nextOrder = direction === 'asc' ? 'desc' : 'asc';
    return handleClick(label, nextOrder);
  };

  return (
    <TableCell
      className={noWrap ? `${classes.noWrap}` : ''}
      {...rest}
      sortDirection={direction}
      role="columnheader"
      onClick={onHandleClick}
    >
      <TableSortLabel
        active={active}
        direction={direction}
        // onClick={onHandleClick}
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
