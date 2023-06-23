import * as React from 'react';
import GridView from 'src/assets/icons/grid-view.svg';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableHead } from 'src/components/TableHead';
import Tooltip from 'src/components/core/Tooltip';
import { GroupByTagToggle } from 'src/components/EntityTable/EntityTableHeader';
import { OrderByProps } from 'src/components/OrderBy';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { StyledToggleButton } from './DisplayLinodes.styles';

const useStyles = makeStyles((theme: Theme) => ({
  controlHeader: {
    backgroundColor: theme.bg.tableHeader,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  // There's nothing very scientific about the widths across the breakpoints
  // here, just a lot of trial and error based on maximum expected column sizes.
  labelCell: {
    ...theme.applyTableHeaderStyles,
    [theme.breakpoints.down('lg')]: {
      width: '20%',
    },
    width: '24%',
  },
  lastBackupCell: {
    ...theme.applyTableHeaderStyles,
    [theme.breakpoints.down('sm')]: {
      width: '18%',
    },
    width: '14%',
  },
  planCell: {
    ...theme.applyTableHeaderStyles,
    [theme.breakpoints.only('sm')]: {
      width: '15%',
    },
    width: '14%',
  },
  regionCell: {
    ...theme.applyTableHeaderStyles,
    [theme.breakpoints.down('sm')]: {
      width: '18%',
    },
    width: '14%',
  },
  statusCell: {
    ...theme.applyTableHeaderStyles,
    [theme.breakpoints.down('md')]: {
      width: '25%',
    },
    [theme.breakpoints.only('md')]: {
      width: '27%',
    },
    width: '20%',
  },
}));

interface Props {
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
}

type CombinedProps<T> = Props & Omit<OrderByProps<T>, 'data'>;

const SortableTableHead = <T extends unknown>(props: CombinedProps<T>) => {
  const classes = useStyles();

  const {
    handleOrderChange,
    isVLAN,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    toggleGroupLinodes,
    toggleLinodeView,
  } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead role="rowgroup" data-qa-table-head>
      <TableRow>
        <TableSortCell
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          className={classes.labelCell}
          data-qa-sort-label={order}
        >
          Label
        </TableSortCell>
        <TableSortCell
          noWrap
          label="_statusPriority"
          direction={order}
          active={isActive('_statusPriority')}
          className={classes.statusCell}
          handleClick={handleOrderChange}
        >
          Status
        </TableSortCell>
        {isVLAN ? (
          <TableSortCell
            label="_vlanIP"
            active={isActive('_vlanIP')}
            handleClick={handleOrderChange}
            direction={order}
          >
            VLAN IP
          </TableSortCell>
        ) : null}
        {isVLAN ? null : (
          <>
            <Hidden smDown>
              <TableSortCell
                label="type"
                active={isActive('type')}
                handleClick={handleOrderChange}
                direction={order}
                className={classes.planCell}
              >
                Plan
              </TableSortCell>
              <TableSortCell
                label="ipv4[0]" // we want to sort by the first ipv4
                active={isActive('ipv4[0]')}
                handleClick={handleOrderChange}
                direction={order}
              >
                IP Address
              </TableSortCell>
              <Hidden lgDown>
                <TableSortCell
                  label="region"
                  direction={order}
                  active={isActive('region')}
                  handleClick={handleOrderChange}
                  className={classes.regionCell}
                  data-qa-sort-region={order}
                >
                  Region
                </TableSortCell>
              </Hidden>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                noWrap
                label="backups:last_successful"
                direction={order}
                active={isActive('backups:last_successful')}
                className={classes.lastBackupCell}
                handleClick={handleOrderChange}
              >
                Last Backup
              </TableSortCell>
            </Hidden>
          </>
        )}
        <TableCell sx={{ padding: '0 !important' }}>
          <div className={classes.controlHeader}>
            <div id="displayViewDescription" className="visually-hidden">
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="Summary view">
              <StyledToggleButton
                aria-label="Toggle display"
                aria-describedby={'displayViewDescription'}
                onClick={toggleLinodeView}
                disableRipple
                isActive={linodeViewPreference === 'grid'}
                size="large"
              >
                <GridView />
              </StyledToggleButton>
            </Tooltip>
            <GroupByTagToggle
              toggleGroupByTag={toggleGroupLinodes}
              isGroupedByTag={linodesAreGrouped}
            />
          </div>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
