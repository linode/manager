import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table, { TableProps } from 'src/components/core/Table';

type ClassNames = 'root' | 'border' | 'stickyHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      overflowX: 'auto',
      overflowY: 'hidden',
      '& tbody': {
        transition: theme.transitions.create(['opacity'])
      },
      '& tbody.sorting': {
        opacity: 0.5
      },
      '& thead': {
        '& th': {
          borderTop: `2px solid ${theme.color.grey9}`,
          borderRight: `1px solid ${theme.color.grey9}`,
          borderBottom: `2px solid ${theme.color.grey9}`,
          borderLeft: `1px solid ${theme.color.grey9}`,
          fontFamily: theme.font.bold,
          fontSize: '0.875em !important',
          color: theme.palette.text.primary,
          padding: '10px 15px',
          '&:first-of-type': {
            borderLeft: 'none'
          },
          '&:last-of-type': {
            borderRight: 'none'
          }
        }
      }
    },
    border: {
      border: `1px solid ${theme.palette.divider}`,
      borderBottom: 0
    },
    stickyHeader: {
      borderTop: 0,
      '& th': {
        position: 'sticky',
        backgroundColor: theme.bg.tableHeader,
        paddingTop: 0,
        paddingBottom: 0,
        height: 48,
        zIndex: 5,
        borderTop: `1px solid ${theme.palette.divider}`,
        '&:first-child::before': {
          content: '""',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.bg.tableHeader,
          position: 'absolute',
          width: 5,
          top: -1,
          borderBottom: `2px solid ${theme.palette.divider}`,
          height: 48,
          left: -5
        }
      }
    }
  });

export interface Props extends TableProps {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
  border?: boolean;
  spacingTop?: 0 | 8 | 16 | 24;
  spacingBottom?: 0 | 8 | 16 | 24;
  stickyHeader?: boolean;
  removeLabelonMobile?: boolean; // only for table instances where we want to hide the cell label for small screens
  tableCaption?: string;
  colCount?: number;
  rowCount?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      className,
      tableClass,
      border,
      noOverflow,
      spacingTop,
      spacingBottom,
      stickyHeader,
      colCount,
      rowCount,
      ...rest
    } = this.props;

    return (
      <div
        className={classNames(
          'tableWrapper',
          {
            [classes.root]: !noOverflow,
            [classes.border]: border,
            [classes.stickyHeader]: stickyHeader
          },
          className
        )}
        style={{
          marginTop: spacingTop !== undefined ? spacingTop : 0,
          marginBottom: spacingBottom !== undefined ? spacingBottom : 0
        }}
      >
        <Table
          className={tableClass}
          {...rest}
          aria-colcount={colCount}
          aria-rowcount={rowCount}
          role="table"
        >
          {this.props.children}
        </Table>
      </div>
    );
  }
}

export default withStyles(styles)(WrappedTable);
