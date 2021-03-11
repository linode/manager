import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';

// @todo: the CMR styles for TableSortCell aren't being applied and I can't
// figure out why so I had to use '!important' to overwrite them
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& th': {
      cursor: 'pointer',
      fontFamily: theme.font.bold,
      backgroundColor: theme.cmrBGColors.bgTableHeader,
      border: `1px solid ${theme.cmrBorderColors.borderTable}`,
      height: 40,
      padding: '10px 15px',
      '&:first-of-type': {
        borderLeft: 'none',
      },
      '&:last-of-type': {
        borderRight: 'none',
      },
      '&:hover': {
        ...theme.applyTableHeaderStyles,
      },
    },
  },
  noHover: {
    width: 'calc(100% - 65px)',
    '&:hover': {
      backgroundColor: `${theme.cmrBGColors.bgTableHeader} !important`,
      cursor: 'default',
    },
  },
  stackscriptTitles: {
    width: '40%',
    '&:before': {
      top: '0 !important',
      left: '0 !important',
      width: '0 !important',
      height: '0 !important',
    },
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
  },
  selectingStackscriptTitles: {
    paddingLeft: '10px !important',
    width: 'calc(100% - 65px)',
  },
  deploys: {
    width: '13%',
    [theme.breakpoints.down('sm')]: {
      width: '15%',
    },
  },
  revisions: {
    width: '13%',
  },
  tags: {
    width: '17%',
  },
  status: {
    width: '5%',
  },
  actionMenu: {
    width: '10%',
  },
  tr: {
    height: 48,
  },
  tableHead: {
    color: theme.cmrTextColors.tableHeader,
    top: 104,
    '& span': {
      color: theme.cmrTextColors.tableHeader,
    },
  },
}));

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'label' | 'deploys' | 'revision';

interface Props {
  category?: string;
  isSelecting?: boolean;
  handleClickTableHeader?: (value: string) => void;
  sortOrder?: SortOrder;
  currentFilterType: CurrentFilter | null;
}

type CombinedProps = Props;

export const StackScriptTableHead: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    currentFilterType,
    isSelecting,
    handleClickTableHeader,
    sortOrder,
    category,
  } = props;

  const Cell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder ? TableSortCell : TableCell;

  const maybeAddSortingProps = (orderBy: string) =>
    !!handleClickTableHeader && sortOrder
      ? {
          direction: sortOrder,
          active: currentFilterType === orderBy,
          label: orderBy,
          handleClick: handleClickTableHeader,
        }
      : {};

  const communityStackScripts = category === 'community';

  return (
    <TableHead className={classes.root}>
      <TableRow className={classes.tr}>
        {/* {!!isSelecting && (
          <TableCell className={`${classes.tableHead} ${classes.noHover}`} />
        )} */}
        {/* The column width jumps in the Linode Create flow when the user
            clicks on the table header. This is currently also happening in
            production and might be related to the difference in width between
            the panels in the StackScript landing page and the one in the
            Linode Create flow.  */}
        <Cell
          className={classNames({
            [classes.tableHead]: true,
            [classes.stackscriptTitles]: true,
            [classes.selectingStackscriptTitles]: isSelecting,
          })}
          colSpan={isSelecting ? 2 : 1}
          data-qa-stackscript-table-header
          {...maybeAddSortingProps('label')}
        >
          StackScript
        </Cell>
        {!isSelecting && (
          <Cell
            className={`${classes.tableHead} ${classes.deploys}`}
            data-qa-stackscript-active-deploy-header
            {...maybeAddSortingProps('deploys')}
          >
            Total Deploys
          </Cell>
        )}
        {!isSelecting && (
          <Hidden smDown>
            <Cell
              className={`${classes.tableHead} ${classes.revisions}`}
              data-qa-stackscript-revision-header
              {...maybeAddSortingProps('revision')}
            >
              Last Revision
            </Cell>
          </Hidden>
        )}
        {!isSelecting && (
          <Hidden smDown>
            <TableCell
              className={`${classes.tableHead} ${classes.tags} ${classes.noHover}`}
              data-qa-stackscript-compatible-images
            >
              Compatible Images
            </TableCell>
          </Hidden>
        )}
        {!isSelecting && !communityStackScripts ? (
          <Hidden mdDown>
            <TableCell
              className={`${classes.tableHead} ${classes.status} ${classes.noHover}`}
              data-qa-stackscript-status-header
            >
              Status
            </TableCell>
          </Hidden>
        ) : null}
        {!isSelecting && (
          <TableCell
            className={`${classes.tableHead} ${classes.actionMenu} ${classes.noHover}`}
          />
        )}
      </TableRow>
    </TableHead>
  );
};

export default StackScriptTableHead;
