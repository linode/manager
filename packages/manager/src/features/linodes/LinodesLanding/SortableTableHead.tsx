import * as React from 'react';
import GridView from 'src/assets/icons/grid-view.svg';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import Tooltip from 'src/components/core/Tooltip';
import { GroupByTagToggle } from 'src/components/EntityTable/EntityTableHeader';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

const useStyles = makeStyles((theme: Theme) => ({
  controlHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: theme.cmrBGColors.bgTableHeader,
  },
  toggleButton: {
    color: '#d2d3d4',
    padding: '0 10px',
    '&:focus': {
      outline: '1px dotted #999',
    },
  },
  // There's nothing very scientific about the widths across the breakpoints
  // here, just a lot of trial and error based on maximum expected column sizes.
  labelCell: {
    ...theme.applyTableHeaderStyles,
    width: '24%',
    [theme.breakpoints.down('md')]: {
      width: '20%',
    },
  },
  statusCell: {
    ...theme.applyTableHeaderStyles,
    width: '20%',
    [theme.breakpoints.only('md')]: {
      width: '27%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '25%',
    },
  },
  planCell: {
    ...theme.applyTableHeaderStyles,
    width: '14%',
    [theme.breakpoints.only('sm')]: {
      width: '15%',
    },
  },
  ipAddressCell: {
    ...theme.applyTableHeaderStyles,
    width: '14%',
    [theme.breakpoints.only('sm')]: {
      width: '22%',
    },
  },
  regionCell: {
    ...theme.applyTableHeaderStyles,
    width: '14%',
    [theme.breakpoints.down('xs')]: {
      width: '18%',
    },
  },
  lastBackupCell: {
    ...theme.applyTableHeaderStyles,
    width: '14%',
    [theme.breakpoints.down('xs')]: {
      width: '18%',
    },
  },
  actionCell: {
    width: '16%',
    [theme.breakpoints.only('md')]: {
      width: '10%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '12%',
    },
  },
}));

interface Props {
  toggleLinodeView: () => 'list' | 'grid';
  linodeViewPreference: 'list' | 'grid';
  toggleGroupLinodes: () => boolean;
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
}

type CombinedProps = Props & Omit<OrderByProps, 'data'>;

const SortableTableHead: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    handleOrderChange,
    order,
    orderBy,
    toggleLinodeView,
    linodeViewPreference,
    toggleGroupLinodes,
    linodesAreGrouped,
    isVLAN,
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
            <Hidden xsDown>
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
                className={classes.ipAddressCell}
              >
                IP Address
              </TableSortCell>
              <Hidden mdDown>
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
            <Hidden mdDown>
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
        <TableCell className={classes.actionCell}>
          <div className={classes.controlHeader}>
            <div id="displayViewDescription" className="visually-hidden">
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="Summary view">
              <IconButton
                aria-label="Toggle display"
                aria-describedby={'displayViewDescription'}
                onClick={toggleLinodeView}
                disableRipple
                className={classes.toggleButton}
              >
                <GridView />
              </IconButton>
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
