import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import {
  TableProps as _TableProps,
  default as _Table,
} from '@mui/material/Table';

const useStyles = makeStyles()((theme: Theme) => ({
  noBorder: {
    '& thead th': {
      border: 0,
    },
  },
  root: {
    '& thead': {
      '& th': {
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
        backgroundColor: theme.bg.tableHeader,
        borderBottom: `2px solid ${theme.borderColors.borderTable}`,
        borderLeft: `1px solid ${theme.borderColors.borderTable}`,
        borderRight: `1px solid ${theme.borderColors.borderTable}`,
        borderTop: `2px solid ${theme.borderColors.borderTable}`,
        color: theme.textColors.tableHeader,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        padding: '10px 15px',
      },
    },
    overflowX: 'auto',
    overflowY: 'hidden',
  },
}));

export interface TableProps extends _TableProps {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
  noBorder?: boolean;
  spacingTop?: 0 | 8 | 16 | 24;
  spacingBottom?: 0 | 8 | 16 | 24;
  tableCaption?: string;
  colCount?: number;
  rowCount?: number;
}

export const Table = (props: TableProps) => {
  const { classes, cx } = useStyles();

  const {
    className,
    colCount,
    noBorder,
    noOverflow,
    rowCount,
    spacingBottom,
    spacingTop,
    tableClass,
    ...rest
  } = props;

  return (
    <div
      className={cx(
        {
          [classes.noBorder]: noBorder,
          [classes.root]: !noOverflow,
        },
        className
      )}
      style={{
        marginBottom: spacingBottom !== undefined ? spacingBottom : 0,
        marginTop: spacingTop !== undefined ? spacingTop : 0,
      }}
    >
      <_Table
        className={tableClass}
        {...rest}
        aria-colcount={colCount}
        aria-rowcount={rowCount}
        role="table"
      >
        {props.children}
      </_Table>
    </div>
  );
};
