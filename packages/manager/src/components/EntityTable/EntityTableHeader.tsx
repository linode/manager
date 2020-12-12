import * as React from 'react';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Tooltip from 'src/components/core/Tooltip';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import useFlags from 'src/hooks/useFlags';
import { HeaderCell } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenHeaderCell: theme.visually.hidden,
  root: {
    '& td': {
      borderTop: 0,
      paddingLeft: '15px',
      paddingRight: '15px'
    }
  },
  thead: {
    '& p': {
      fontFamily: theme.font.bold,
      fontWeight: 500
    }
  },
  '& .MuiTableCell-head': {
    borderBottom: 0
  },
  controlHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: theme.cmrBGColors.bgTableHeader
  },
  toggleButton: {
    padding: '0 10px',
    '&:focus': {
      // Browser default until we get styling direction for focus states
      outline: '1px dotted #999'
    }
  }
}));

interface Props extends Omit<OrderByProps, 'data'> {
  headers: HeaderCell[];
  toggleGroupByTag?: () => boolean;
  isGroupedByTag?: boolean;
}

interface SortCellProps extends Omit<Props, 'headers'> {
  thisCell: HeaderCell;
}

interface NormalCellProps {
  thisCell: HeaderCell;
}

export const EntityTableHeader: React.FC<Props> = props => {
  const {
    headers,
    handleOrderChange,
    order,
    orderBy,
    toggleGroupByTag,
    isGroupedByTag
  } = props;
  const classes = useStyles();
  const flags = useFlags();

  const SortCell = flags.cmr ? TableSortCell_CMR : TableSortCell;

  const _SortCell: React.FC<SortCellProps> = props => {
    const { orderBy, order, thisCell, handleOrderChange } = props;
    return (
      <SortCell
        active={orderBy === thisCell.dataColumn}
        label={thisCell.dataColumn}
        direction={order}
        handleClick={handleOrderChange}
        style={{ width: `${thisCell.widthPercent}%` }}
        data-testid={`${thisCell.label}-header-cell`}
      >
        {thisCell.label}
      </SortCell>
    );
  };

  const _NormalCell: React.FC<NormalCellProps> = props => {
    const { thisCell } = props;
    return (
      <TableCell
        data-testid={`${thisCell.label}-header-cell`}
        className={classes.thead}
        style={{ width: `${thisCell.widthPercent}%` }}
      >
        <span
          className={
            thisCell.visuallyHidden ? classes.hiddenHeaderCell : undefined
          }
        >
          {thisCell.label}
        </span>
      </TableCell>
    );
  };

  return (
    <TableHead>
      <TableRow>
        {headers.map(thisCell =>
          thisCell.sortable ? (
            thisCell.hideOnTablet ? (
              <Hidden smDown key={thisCell.dataColumn}>
                <_SortCell
                  thisCell={thisCell}
                  order={order}
                  orderBy={orderBy}
                  handleOrderChange={handleOrderChange}
                />
              </Hidden>
            ) : thisCell.hideOnMobile ? (
              <Hidden xsDown key={thisCell.dataColumn}>
                <_SortCell
                  thisCell={thisCell}
                  order={order}
                  orderBy={orderBy}
                  handleOrderChange={handleOrderChange}
                />
              </Hidden>
            ) : (
              <_SortCell
                thisCell={thisCell}
                key={thisCell.dataColumn}
                order={order}
                orderBy={orderBy}
                handleOrderChange={handleOrderChange}
              />
            )
          ) : (
            [
              thisCell.hideOnTablet ? (
                <Hidden smDown key={thisCell.dataColumn}>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : thisCell.hideOnMobile ? (
                <Hidden xsDown key={thisCell.dataColumn}>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : (
                <_NormalCell thisCell={thisCell} />
              )
            ]
          )
        )}
        <TableCell>
          <div className={classes.controlHeader}>
            <div id="groupByDescription" className="visually-hidden">
              {isGroupedByTag
                ? 'group by tag is currently enabled'
                : 'group by tag is currently disabled'}
            </div>
            <Tooltip
              placement="top-end"
              title={`${isGroupedByTag ? 'Ungroup' : 'Group'} by tag`}
            >
              <IconButton
                aria-label={`Toggle group by tag`}
                aria-describedby={'groupByDescription'}
                onClick={toggleGroupByTag}
                disableRipple
                className={classes.toggleButton}
              >
                <GroupByTag />
              </IconButton>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default React.memo(EntityTableHeader);
