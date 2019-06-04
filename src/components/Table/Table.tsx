import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Table, { TableProps } from 'src/components/core/Table';

type ClassNames =
  | 'root'
  | 'border'
  | 'responsive'
  | 'noMobileLabel'
  | 'stickyHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      overflowX: 'auto',
      overflowY: 'hidden',
      '& tbody': {
        transition: [theme.transitions.create('opacity')]
      },
      '& tbody.sorting': {
        opacity: 0.5
      }
    },
    responsive: {
      [theme.breakpoints.down('sm')]: {
        '& .emptyCell': {
          display: 'none'
        },
        '& thead': {
          display: 'none'
        },
        '& tbody > tr': {
          marginBottom: 0,
          '& > td:first-child': {
            backgroundColor: theme.bg.tableHeader,
            '& .data': {
              textAlign: 'left'
            }
          }
        },
        '& tr': {
          display: 'block',
          marginBottom: 20,
          height: 'auto'
        },
        '& td': {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 32
        }
      }
    },
    noMobileLabel: {
      [theme.breakpoints.down('sm')]: {
        '& tbody > tr > td:first-child': {
          '& > span:first-child': {
            display: 'none'
          }
        },
        '& .data': {
          marginLeft: 0
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

interface Props {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
  border?: boolean;
  isResponsive?: boolean; // back-door for tables that don't need to be responsive
  spacingTop?: 0 | 8 | 16 | 24;
  spacingBottom?: 0 | 8 | 16 | 24;
  stickyHeader?: boolean;
  removeLabelonMobile?: boolean; // only for table instances where we want to hide the cell label for small screens
}

type CombinedProps = Props & TableProps & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      className,
      isResponsive,
      tableClass,
      border,
      noOverflow,
      spacingTop,
      spacingBottom,
      removeLabelonMobile,
      stickyHeader,
      ...rest
    } = this.props;

    return (
      <div
        className={classNames(
          'tableWrapper',
          {
            [classes.root]: !noOverflow,
            [classes.responsive]: !(isResponsive === false), // must be explicity set to false
            [classes.border]: border,
            [classes.noMobileLabel]: removeLabelonMobile,
            [classes.stickyHeader]: stickyHeader
          },
          className
        )}
        style={{
          marginTop: spacingTop !== undefined ? spacingTop : 0,
          marginBottom: spacingBottom !== undefined ? spacingBottom : 0
        }}
      >
        <Table className={tableClass} {...rest}>
          {this.props.children}
        </Table>
      </div>
    );
  }
}

export default withStyles(styles)(WrappedTable);
