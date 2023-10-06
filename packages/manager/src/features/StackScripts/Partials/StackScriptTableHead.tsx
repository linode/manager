import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

const useStyles = makeStyles((theme: Theme) => ({
  deploys: {
    [theme.breakpoints.down('lg')]: {
      width: '15%',
    },
    [theme.breakpoints.down('md')]: {
      width: '17%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '28%',
    },
    width: '10%',
  },
  images: {
    width: '26%',
  },
  imagesAccount: {
    width: '20%',
  },
  noHover: {
    cursor: 'default !important',
  },
  revisions: {
    [theme.breakpoints.down('lg')]: {
      width: '17%',
    },
    [theme.breakpoints.down('md')]: {
      width: '23%',
    },
    whiteSpace: 'nowrap',
    width: '13%',
  },
  root: {
    '& th': {
      '&:first-of-type': {
        borderLeft: 'none',
      },
      '&:hover': {
        ...theme.applyTableHeaderStyles,
      },
      '&:last-of-type': {
        borderRight: 'none',
      },
      backgroundColor: theme.bg.tableHeader,
      borderBottom: `2px solid ${theme.borderColors.borderTable}`,
      borderTop: `2px solid ${theme.borderColors.borderTable}`,
      fontFamily: theme.font.bold,
      padding: '10px 15px',
    },
  },
  selectingStackscriptTitles: {
    paddingLeft: '20px !important',
    width: 'calc(100% - 65px)',
  },
  stackscriptTitles: {
    [theme.breakpoints.down('lg')]: {
      width: '48%',
    },
    [theme.breakpoints.down('md')]: {
      width: '50%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '60%',
    },
    width: '36%',
  },
  stackscriptTitlesAccount: {
    [theme.breakpoints.down('lg')]: {
      width: '38%',
    },
    [theme.breakpoints.down('md')]: {
      width: '50%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '60%',
    },
    width: '26%',
  },
  status: {
    width: '7%',
  },
  tableHead: {
    '& span': {
      color: theme.textColors.tableHeader,
    },
    color: theme.textColors.tableHeader,
    top: 104,
  },
}));

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'deploys' | 'label' | 'revision';

interface Props {
  category?: string;
  currentFilterType: CurrentFilter | null;
  handleClickTableHeader?: (value: string) => void;
  isSelecting?: boolean;
  sortOrder?: SortOrder;
}

export const StackScriptTableHead = (props: Props) => {
  const classes = useStyles();
  const {
    category,
    currentFilterType,
    handleClickTableHeader,
    isSelecting,
    sortOrder,
  } = props;

  const Cell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder ? TableSortCell : TableCell;

  const maybeAddSortingProps = (orderBy: string) =>
    !!handleClickTableHeader && sortOrder
      ? {
          active: currentFilterType === orderBy,
          direction: sortOrder,
          handleClick: handleClickTableHeader,
          label: orderBy,
        }
      : {};

  const communityStackScripts = category === 'community';

  return (
    <TableHead className={classes.root}>
      <TableRow>
        {/* The column width jumps in the Linode Create flow when the user
            clicks on the table header. This is currently also happening in
            production and might be related to the difference in width between
            the panels in the StackScript landing page and the one in the
            Linode Create flow.  */}
        <Cell
          className={classNames({
            [classes.selectingStackscriptTitles]: isSelecting,
            [classes.stackscriptTitles]: true,
            [classes.stackscriptTitlesAccount]: category === 'account',
            [classes.tableHead]: true,
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
          <Hidden lgDown>
            <TableCell
              className={classNames({
                [classes.images]: true,
                [classes.imagesAccount]: category === 'account',
                [classes.noHover]: true,
                [classes.tableHead]: true,
              })}
              data-qa-stackscript-compatible-images
            >
              Compatible Images
            </TableCell>
          </Hidden>
        )}
        {!isSelecting && !communityStackScripts ? (
          <Hidden lgDown>
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
