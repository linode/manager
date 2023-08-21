import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import GridView from 'src/assets/icons/grid-view.svg';
import { GroupByTagToggle } from 'src/components/EntityTable/EntityTableHeader';
import { Hidden } from 'src/components/Hidden';
import { OrderByProps } from 'src/components/OrderBy';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Tooltip } from 'src/components/Tooltip';
import { useFlags } from 'src/hooks/useFlags';

import { StyledToggleButton } from './DisplayLinodes.styles';

// There's nothing very scientific about the widths across the breakpoints
// here, just a lot of trial and error based on maximum expected column sizes.

interface Props {
  isVLAN?: boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
}

type CombinedProps<T> = Props & Omit<OrderByProps<T>, 'data'>;

export const SortableTableHead = <T extends unknown>(
  props: CombinedProps<T>
) => {
  const flags = useFlags();
  const theme = useTheme();

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
    <TableHead data-qa-table-head role="rowgroup">
      <TableRow>
        <TableSortCell
          active={isActive('label')}
          data-qa-sort-label={order}
          direction={order}
          handleClick={handleOrderChange}
          label="label"
          sx={{
            ...theme.applyTableHeaderStyles,
            [theme.breakpoints.down('lg')]: {
              width: '20%',
            },
            width: '24%',
          }}
        >
          Label
        </TableSortCell>
        <TableSortCell
          active={isActive('_statusPriority')}
          direction={order}
          handleClick={handleOrderChange}
          label="_statusPriority"
          noWrap
          sx={{
            ...theme.applyTableHeaderStyles,
            [theme.breakpoints.down('md')]: {
              width: '25%',
            },
            [theme.breakpoints.only('md')]: {
              width: '27%',
            },
            width: '20%',
          }}
        >
          Status
        </TableSortCell>
        {isVLAN ? (
          <TableSortCell
            active={isActive('_vlanIP')}
            direction={order}
            handleClick={handleOrderChange}
            label="_vlanIP"
          >
            VLAN IP
          </TableSortCell>
        ) : null}
        {isVLAN ? null : (
          <>
            <Hidden smDown>
              <TableSortCell
                active={isActive('type')}
                direction={order}
                handleClick={handleOrderChange}
                label="type"
                sx={{
                  ...theme.applyTableHeaderStyles,
                  [theme.breakpoints.only('sm')]: {
                    width: '15%',
                  },
                  width: '14%',
                }}
              >
                Plan
              </TableSortCell>
              <TableSortCell
                active={isActive('ipv4[0]')}
                direction={order}
                handleClick={handleOrderChange}
                label="ipv4[0]" // we want to sort by the first ipv4
                noWrap
              >
                Public IP Address
              </TableSortCell>
              <Hidden lgDown>
                <TableSortCell
                  active={isActive('region')}
                  data-qa-sort-region={order}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="region"
                  sx={{
                    ...theme.applyTableHeaderStyles,
                    [theme.breakpoints.down('sm')]: {
                      width: '18%',
                    },
                    width: '14%',
                  }}
                >
                  Region
                </TableSortCell>
              </Hidden>
            </Hidden>
            {flags.vpc && (
              <Hidden smDown>
                <TableCell>VPC</TableCell>
              </Hidden>
            )}
            <Hidden lgDown>
              <TableSortCell
                active={isActive('backups:last_successful')}
                direction={order}
                handleClick={handleOrderChange}
                label="backups:last_successful"
                noWrap
                sx={{
                  ...theme.applyTableHeaderStyles,
                  [theme.breakpoints.down('sm')]: {
                    width: '18%',
                  },
                  width: '14%',
                }}
              >
                Last Backup
              </TableSortCell>
            </Hidden>
          </>
        )}
        <TableCell sx={{ padding: '0 !important' }}>
          <div
            style={{
              backgroundColor: theme.bg.tableHeader,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div className="visually-hidden" id="displayViewDescription">
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="Summary view">
              <StyledToggleButton
                aria-describedby={'displayViewDescription'}
                aria-label="Toggle display"
                disableRipple
                isActive={linodeViewPreference === 'grid'}
                onClick={toggleLinodeView}
                size="large"
              >
                <GridView />
              </StyledToggleButton>
            </Tooltip>
            <GroupByTagToggle
              isGroupedByTag={linodesAreGrouped}
              toggleGroupByTag={toggleGroupLinodes}
            />
          </div>
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
