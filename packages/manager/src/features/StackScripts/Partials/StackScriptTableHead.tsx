import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& th': {
      backgroundColor: theme.cmrBGColors.bgTableHeader,
      border: `1px solid ${theme.cmrBorderColors.borderTable}`,
      fontFamily: theme.font.bold,
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
  tr: {
    height: 44,
  },
  tableHead: {
    color: theme.cmrTextColors.tableHeader,
    top: 104,
    '& span': {
      color: theme.cmrTextColors.tableHeader,
    },
  },
  noHover: {
    cursor: 'default !important',
  },
  stackscriptTitles: {
    width: '36%',
    [theme.breakpoints.down('md')]: {
      width: '48%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '60%',
    },
  },
  stackscriptTitlesAccount: {
    width: '26%',
    [theme.breakpoints.down('md')]: {
      width: '38%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '50%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '60%',
    },
  },
  selectingStackscriptTitles: {
    paddingLeft: '20px !important',
    width: 'calc(100% - 65px)',
  },
  deploys: {
    width: '10%',
    [theme.breakpoints.down('md')]: {
      width: '15%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '17%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '28%',
    },
  },
  revisions: {
    whiteSpace: 'nowrap',
    width: '13%',
    [theme.breakpoints.down('md')]: {
      width: '17%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '23%',
    },
  },
  images: {
    width: '26%',
  },
  imagesAccount: {
    width: '20%',
  },
  status: {
    width: '7%',
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
        {/* The column width jumps in the Linode Create flow when the user
            clicks on the table header. This is currently also happening in
            production and might be related to the difference in width between
            the panels in the StackScript landing page and the one in the
            Linode Create flow.  */}
        <Cell
          className={classNames({
            [classes.tableHead]: true,
            [classes.stackscriptTitles]: true,
            [classes.stackscriptTitlesAccount]: category === 'account',
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
            Deploys
          </Cell>
        )}
        {!isSelecting && (
          <Hidden xsDown>
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
          <Hidden mdDown>
            <TableCell
              className={classNames({
                [classes.tableHead]: true,
                [classes.images]: true,
                [classes.imagesAccount]: category === 'account',
                [classes.noHover]: true,
              })}
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
          <TableCell className={`${classes.tableHead} ${classes.noHover}`} />
        )}
      </TableRow>
    </TableHead>
  );
};

export default StackScriptTableHead;
