import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';

// @todo: the CMR styles for TableSortCell aren't being applied and I can't
// figure out why so I had to use '!important' to overwrite them
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& th': {
      cursor: 'pointer',
      height: 40,
      padding: '10px 15px',
      '&:hover': {
        backgroundColor: '#3683dc',
        '& span': {
          color: theme.color.white,
          '& svg': {
            color: `${theme.color.white} !important`
          }
        }
      }
    }
  },
  noHover: {
    width: 'calc(100% - 65px)',
    '&:hover': {
      backgroundColor: `${theme.bg.offWhite} !important`,
      cursor: 'default'
    }
  },
  stackscriptTitles: {
    width: '54%',
    '&:before': {
      top: '0 !important',
      left: '0 !important',
      width: '0 !important',
      height: '0 !important'
    }
  },
  selectingStackscriptTitles: {
    paddingLeft: '10px !important',
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
    <TableHead className={classes.root}>
      <TableRow>
        {!!isSelecting && <TableCell className={classes.noHover} />}
        {/* The column width jumps in the Linode Create flow when the user
            clicks on the table header. This is currently also happening in
            production and might be related to the difference in width between
            the panels in the StackScript landing page and the one in the
            Linode Create flow.  */}
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
