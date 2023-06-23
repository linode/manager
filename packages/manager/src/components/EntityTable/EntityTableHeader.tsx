import * as React from 'react';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableHead } from 'src/components/TableHead';
import Tooltip from 'src/components/core/Tooltip';
import { OrderByProps } from 'src/components/OrderBy';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Entity, HeaderCell } from './types';
import { StyledToggleButton } from 'src/features/Linodes/LinodesLanding/DisplayLinodes.styles';

const useStyles = makeStyles((theme: Theme) => ({
  groupByTagCell: {
    backgroundColor: theme.bg.tableHeader,
    paddingRight: `0px !important`,
    textAlign: 'right',
  },
  hiddenHeaderCell: theme.visually.hidden,
}));

interface Props extends Omit<OrderByProps<Entity>, 'data'> {
  headers: HeaderCell[];
  toggleGroupByTag?: () => boolean;
  isGroupedByTag?: boolean;
  isLargeAccount?: boolean;
}

interface SortCellProps extends Omit<Props, 'headers'> {
  thisCell: HeaderCell;
}

interface NormalCellProps {
  thisCell: HeaderCell;
}

export const EntityTableHeader: React.FC<Props> = (props) => {
  const {
    handleOrderChange,
    headers,
    isGroupedByTag,
    isLargeAccount,
    order,
    orderBy,
    toggleGroupByTag,
  } = props;
  const classes = useStyles();

  const SortCell: React.FC<SortCellProps> = (props) => {
    const { handleOrderChange, order, orderBy, thisCell } = props;
    return (
      <TableSortCell
        active={orderBy === thisCell.dataColumn}
        label={thisCell.dataColumn}
        direction={order}
        handleClick={handleOrderChange}
        style={{ width: `${thisCell.widthPercent}%` }}
        data-testid={`${thisCell.label}-header-cell`}
      >
        {thisCell.label}
      </TableSortCell>
    );
  };

  const _NormalCell: React.FC<NormalCellProps> = (props) => {
    const { thisCell } = props;
    return (
      <TableCell
        data-testid={`${thisCell.label}-header-cell`}
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
        {headers.map((thisCell) =>
          thisCell.sortable ? (
            thisCell.hideOnTablet ? (
              <Hidden mdDown key={thisCell.dataColumn}>
                <SortCell
                  thisCell={thisCell}
                  order={order}
                  orderBy={orderBy}
                  handleOrderChange={handleOrderChange}
                />
              </Hidden>
            ) : thisCell.hideOnMobile ? (
              <Hidden smDown key={thisCell.dataColumn}>
                <SortCell
                  thisCell={thisCell}
                  order={order}
                  orderBy={orderBy}
                  handleOrderChange={handleOrderChange}
                />
              </Hidden>
            ) : (
              <SortCell
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
                <Hidden mdDown key={thisCell.dataColumn}>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : thisCell.hideOnMobile ? (
                <Hidden smDown key={thisCell.dataColumn}>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : (
                <_NormalCell thisCell={thisCell} key={thisCell.dataColumn} />
              ),
            ]
          )
        )}
        {toggleGroupByTag && typeof isGroupedByTag !== 'undefined' ? (
          <TableCell className={classes.groupByTagCell}>
            <GroupByTagToggle
              isLargeAccount={isLargeAccount}
              toggleGroupByTag={toggleGroupByTag}
              isGroupedByTag={isGroupedByTag}
            />
          </TableCell>
        ) : null}
      </TableRow>
    </TableHead>
  );
};

export default React.memo(EntityTableHeader);

// =============================================================================
// <GroupByTagToggle />
// =============================================================================
interface GroupByTagToggleProps {
  toggleGroupByTag: () => boolean;
  isGroupedByTag: boolean;
  isLargeAccount?: boolean;
}

export const GroupByTagToggle: React.FC<GroupByTagToggleProps> = React.memo(
  (props) => {
    const { isGroupedByTag, isLargeAccount, toggleGroupByTag } = props;

    return (
      <>
        <div id="groupByDescription" className="visually-hidden">
          {isGroupedByTag
            ? 'group by tag is currently enabled'
            : 'group by tag is currently disabled'}
        </div>
        <Tooltip
          placement="top-end"
          title={`${isGroupedByTag ? 'Ungroup' : 'Group'} by tag`}
        >
          <StyledToggleButton
            aria-label={`Toggle group by tag`}
            aria-describedby={'groupByDescription'}
            onClick={toggleGroupByTag}
            disableRipple
            isActive={isGroupedByTag}
            // Group by Tag is not available if you have a large account.
            // See https://github.com/linode/manager/pull/6653 for more details
            disabled={isLargeAccount}
            size="large"
          >
            <GroupByTag />
          </StyledToggleButton>
        </Tooltip>
      </>
    );
  }
);
