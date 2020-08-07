import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  stackscriptTitles: {
    width: '54%'
  },
  // Not sure what this does
  selectingStackscriptTitles: {
    width: 'calc(100% - 65px)'
  },
  deploys: {
    width: '13%'
  },
  revisions: {
    width: '13%'
  },
  tags: {
    width: '15%'
  },
  actionMenu: {
    width: '5%'
  }
}));

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Props {
  isSelecting?: boolean;
  handleClickTableHeader?: (value: string) => void;
  sortOrder?: SortOrder;
  currentFilterType: CurrentFilter | null;
}

type CombinedProps = Props;

export const StackScriptTableHead: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    currentFilterType,
    isSelecting,
    handleClickTableHeader,
    sortOrder
  } = props;

  const Cell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder ? TableSortCell : TableCell;

  const maybeAddSortingProps = (orderBy: string) =>
    !!handleClickTableHeader && sortOrder
      ? {
          direction: sortOrder,
          active: currentFilterType === orderBy,
          label: orderBy,
          handleClick: handleClickTableHeader
        }
      : {};

  return (
    <TableHead>
      <TableRow>
        {!!isSelecting && <TableCell />}
        <Cell
          className={classNames({
            [classes.stackscriptTitles]: true,
            [classes.selectingStackscriptTitles]: isSelecting
          })}
          data-qa-stackscript-table-header
          {...maybeAddSortingProps('label')}
        >
          StackScript
        </Cell>
        {!isSelecting && (
          <Cell
            className={classes.deploys}
            data-qa-stackscript-active-deploy-header
            {...maybeAddSortingProps('deploys')}
          >
            Total Deploys
          </Cell>
        )}
        {!isSelecting && (
          <Cell
            className={classes.revisions}
            data-qa-stackscript-revision-header
            {...maybeAddSortingProps('revision')}
          >
            Last Revision
          </Cell>
        )}
        {!isSelecting && (
          <TableCell
            className={classes.tags}
            data-qa-stackscript-compatible-images
          >
            Compatible Images
          </TableCell>
        )}
        {!isSelecting && <TableCell />}
      </TableRow>
    </TableHead>
  );
};

export default StackScriptTableHead;
