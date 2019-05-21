import * as classNames from 'classnames';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table, { TableProps } from 'src/components/core/Table';

type ClassNames = 'root' | 'border' | 'responsive' | 'noMobileLabel';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
            [classes.noMobileLabel]: removeLabelonMobile
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
