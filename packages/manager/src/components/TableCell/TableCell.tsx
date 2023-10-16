import {
  default as _TableCell,
  TableCellProps as _TableCellProps,
} from '@mui/material/TableCell';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { TooltipIcon } from 'src/components/TooltipIcon';

const useStyles = makeStyles()((theme: Theme) => ({
  actionCell: {
    // Prevents Safari from adding margins to the ActionMenu button
    '& > button': {
      margin: 0,
    },
    alignItems: 'center',
    display: 'flex',
    height: 40,
    justifyContent: 'flex-end',
    padding: 0,
  },
  center: {
    '&:last-child': {
      paddingRight: '15px',
    },
    textAlign: 'center',
  },
  compact: {
    padding: 6,
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  root: {
    '&.emptyCell': {
      height: 40,
    },
    '&:last-child': {
      paddingRight: 0,
    },
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    borderTop: 'none',
    color: theme.textColors.tableStatic,
    fontSize: '.875rem',
    lineHeight: '1rem',
    padding: '0px 15px',
  },
  sortable: {
    '& .sortIcon': {
      color: theme.palette.primary.main,
      left: 10,
      position: 'relative',
      top: 2,
    },
    '& button, & button:focus': {
      color: theme.color.headline,
      fontWeight: 'normal',
    },
    color: theme.color.headline,
    cursor: 'pointer',
    fontWeight: 'normal',
  },
  status: {
    alignItems: 'center',
    display: 'flex',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  },
}));

export interface TableCellProps extends _TableCellProps {
  actionCell?: boolean;
  center?: boolean;
  className?: string;
  compact?: boolean;
  errorCell?: boolean;
  errorText?: string;
  noWrap?: boolean;
  /*
   * parent column will either be the name of the column this
   * TableCell is listed under
   */
  parentColumn?: string;
  sortable?: boolean;
  statusCell?: boolean;
}

export const TableCell = (props: TableCellProps) => {
  const { classes, cx } = useStyles();

  const {
    actionCell,
    center,
    className,
    compact,
    errorCell,
    errorText,
    noWrap,
    parentColumn,
    sortable,
    statusCell,
    ...rest
  } = props;

  return (
    <_TableCell
      className={cx(
        {
          [classes.actionCell]: actionCell,
          [classes.center]: center,
          [classes.compact]: compact,
          [classes.noWrap]: noWrap,
          [classes.root]: true,
          [classes.sortable]: sortable,
          // hide the cell at small breakpoints if it's empty with no parent column
          emptyCell: !parentColumn && !props.children,
        },
        className
      )}
      {...rest}
    >
      {statusCell ? (
        <div className={classes.status}>{props.children}</div>
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
