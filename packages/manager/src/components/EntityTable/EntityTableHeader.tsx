import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import { Hidden } from 'src/components/Hidden';
import { OrderByProps } from 'src/components/OrderBy';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Tooltip } from 'src/components/Tooltip';
import { StyledToggleButton } from 'src/features/Linodes/LinodesLanding/DisplayLinodes.styles';

import { Entity, HeaderCell } from './types';

const useStyles = makeStyles()((theme: Theme) => ({
  groupByTagCell: {
    backgroundColor: theme.bg.tableHeader,
    paddingRight: `0px !important`,
    textAlign: 'right',
  },
  hiddenHeaderCell: theme.visually.hidden,
}));

interface Props extends Omit<OrderByProps<Entity>, 'data'> {
  headers: HeaderCell[];
  isGroupedByTag?: boolean;
  isLargeAccount?: boolean;
  toggleGroupByTag?: () => boolean;
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
  const { classes } = useStyles();

  const SortCell: React.FC<SortCellProps> = (props) => {
    const { handleOrderChange, order, orderBy, thisCell } = props;
    return (
      <TableSortCell
        active={orderBy === thisCell.dataColumn}
        data-testid={`${thisCell.label}-header-cell`}
        direction={order}
        handleClick={handleOrderChange}
        label={thisCell.dataColumn}
        style={{ width: `${thisCell.widthPercent}%` }}
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
              <Hidden key={thisCell.dataColumn} mdDown>
                <SortCell
                  handleOrderChange={handleOrderChange}
                  order={order}
                  orderBy={orderBy}
                  thisCell={thisCell}
                />
              </Hidden>
            ) : thisCell.hideOnMobile ? (
              <Hidden key={thisCell.dataColumn} smDown>
                <SortCell
                  handleOrderChange={handleOrderChange}
                  order={order}
                  orderBy={orderBy}
                  thisCell={thisCell}
                />
              </Hidden>
            ) : (
              <SortCell
                handleOrderChange={handleOrderChange}
                key={thisCell.dataColumn}
                order={order}
                orderBy={orderBy}
                thisCell={thisCell}
              />
            )
          ) : (
            [
              thisCell.hideOnTablet ? (
                <Hidden key={thisCell.dataColumn} mdDown>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : thisCell.hideOnMobile ? (
                <Hidden key={thisCell.dataColumn} smDown>
                  <_NormalCell thisCell={thisCell} />
                </Hidden>
              ) : (
                <_NormalCell key={thisCell.dataColumn} thisCell={thisCell} />
              ),
            ]
          )
        )}
        {toggleGroupByTag && typeof isGroupedByTag !== 'undefined' ? (
          <TableCell className={classes.groupByTagCell}>
            <GroupByTagToggle
              isGroupedByTag={isGroupedByTag}
              isLargeAccount={isLargeAccount}
              toggleGroupByTag={toggleGroupByTag}
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
  isGroupedByTag: boolean;
  isLargeAccount?: boolean;
  toggleGroupByTag: () => boolean;
}

export const GroupByTagToggle: React.FC<GroupByTagToggleProps> = React.memo(
  (props) => {
    const { isGroupedByTag, isLargeAccount, toggleGroupByTag } = props;

    return (
      <>
        <div className="visually-hidden" id="groupByDescription">
          {isGroupedByTag
            ? 'group by tag is currently enabled'
            : 'group by tag is currently disabled'}
        </div>
        <Tooltip
          placement="top-end"
          title={`${isGroupedByTag ? 'Ungroup' : 'Group'} by tag`}
        >
          <StyledToggleButton
            aria-describedby={'groupByDescription'}
            aria-label={`Toggle group by tag`}
            disableRipple
            // See https://github.com/linode/manager/pull/6653 for more details
            disabled={isLargeAccount}
            isActive={isGroupedByTag}
            // Group by Tag is not available if you have a large account.
            onClick={toggleGroupByTag}
            size="large"
          >
            <GroupByTag />
          </StyledToggleButton>
        </Tooltip>
      </>
    );
  }
);
