import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table, { TableProps } from 'src/components/core/Table';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflowX: 'auto',
    overflowY: 'hidden',
    '& tbody': {
      transition: theme.transitions.create(['opacity']),
    },
    '& tbody.sorting': {
      opacity: 0.5,
    },
    '& thead': {
      '& th': {
        backgroundColor: theme.cmrBGColors.bgTableHeader,
        borderTop: `2px solid ${theme.cmrBorderColors.borderTable}`,
        borderRight: `1px solid ${theme.cmrBorderColors.borderTable}`,
        borderBottom: `2px solid ${theme.cmrBorderColors.borderTable}`,
        borderLeft: `1px solid ${theme.cmrBorderColors.borderTable}`,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        color: theme.cmrTextColors.tableHeader,
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

export interface Props extends TableProps {
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

type CombinedProps = Props;

export const WrappedTable: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

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
      className={classNames(
        'tableWrapper',
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
      <Table
        className={tableClass}
        {...rest}
        aria-colcount={colCount}
        aria-rowcount={rowCount}
        role="table"
      >
        {props.children}
      </Table>
    </div>
  );
};

export default WrappedTable;
