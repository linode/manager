import { Theme } from '@mui/material/styles';
import {
  default as _Table,
  TableProps as _TableProps,
} from '@mui/material/Table';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    overflowX: 'auto',
    overflowY: 'hidden',
    '& thead': {
      '& th': {
        backgroundColor: theme.bg.tableHeader,
        borderTop: `2px solid ${theme.borderColors.borderTable}`,
        borderRight: `1px solid ${theme.borderColors.borderTable}`,
        borderBottom: `2px solid ${theme.borderColors.borderTable}`,
        borderLeft: `1px solid ${theme.borderColors.borderTable}`,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        color: theme.textColors.tableHeader,
        padding: '10px 15px',
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
      },
    },
  },
  noBorder: {
    '& thead th': {
      border: 0,
    },
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
    tableClass,
    noBorder,
    noOverflow,
    spacingTop,
    spacingBottom,
    colCount,
    rowCount,
    ...rest
  } = props;

  return (
    <div
      className={cx(
        {
          [classes.root]: !noOverflow,
          [classes.noBorder]: noBorder,
        },
        className
      )}
      style={{
        marginTop: spacingTop !== undefined ? spacingTop : 0,
        marginBottom: spacingBottom !== undefined ? spacingBottom : 0,
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
