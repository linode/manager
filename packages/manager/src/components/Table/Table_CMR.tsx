import * as classNames from 'classnames';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table, { TableProps } from 'src/components/core/Table';

type ClassNames = 'root' | 'border';

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
          backgroundColor: theme.cmrBGColors.bgTableHeader,
          borderTop: `2px solid ${theme.cmrBorderColors.borderTable}`,
          borderRight: `1px solid ${theme.cmrBorderColors.borderTable}`,
          borderBottom: `2px solid ${theme.cmrBorderColors.borderTable}`,
          borderLeft: `1px solid ${theme.cmrBorderColors.borderTable}`,
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
      border: `1px solid ${theme.cmrBorderColors.borderTable}`,
      borderBottom: 0
    }
  });

export interface Props extends TableProps {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
  border?: boolean;
  spacingTop?: 0 | 8 | 16 | 24;
  spacingBottom?: 0 | 8 | 16 | 24;

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
            [classes.border]: border
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
