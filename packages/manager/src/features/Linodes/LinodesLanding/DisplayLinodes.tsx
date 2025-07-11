import { useIsGeckoEnabled } from '@linode/shared';
import { Box, CircleProgress, IconButton, Paper, Tooltip } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useSearch } from '@tanstack/react-router';
import * as React from 'react';

import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter.utils';
import { TableBody } from 'src/components/TableBody';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useFlags } from 'src/hooks/useFlags';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';

import { StyledControlHeader } from './DisplayLinodes.styles';
import { RegionTypeFilter } from './RegionTypeFilter';
import TableWrapper from './TableWrapper';

import type { Config } from '@linode/api-v4/lib/linodes';
import type { OrderByProps } from 'src/components/OrderBy';
import type { PaginationProps } from 'src/components/Paginate';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import type { DialogType } from 'src/features/Linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';
import type { RegionFilter } from 'src/utilities/storage';

export interface RenderLinodesProps
  extends PaginationProps<LinodeWithMaintenance> {
  data: DisplayLinodesProps['data'];
  openDialog: DisplayLinodesProps['openDialog'];
  openPowerActionDialog: DisplayLinodesProps['openPowerActionDialog'];
  showHead?: boolean;
}

interface DisplayLinodesProps extends OrderByProps<LinodeWithMaintenance> {
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  display: 'grid' | 'list';
  filteredLinodesLoading: boolean;
  handleRegionFilter: (regionFilter: RegionFilter) => void;
  linodesAreGrouped: boolean;
  linodeViewPreference: 'grid' | 'list';
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  regionFilter: RegionFilter;
  someLinodesHaveMaintenance: boolean;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
  updatePageUrl: (page: number) => void;
}

export const DisplayLinodes = React.memo((props: DisplayLinodesProps) => {
  const {
    component: Component,
    data,
    display,
    filteredLinodesLoading,
    handleOrderChange,
    handleRegionFilter,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    regionFilter,
    toggleGroupLinodes,
    toggleLinodeView,
    updatePageUrl,
    ...rest
  } = props;

  const displayViewDescriptionId = React.useId();
  const groupByDescriptionId = React.useId();
  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();
  const flags = useFlags();

  const numberOfLinodesWithMaintenance = React.useMemo(() => {
    return data.reduce((acc, thisLinode) => {
      if (thisLinode.maintenance) {
        acc++;
      }
      return acc;
    }, 0);
  }, [JSON.stringify(data)]);

  const count = data.length;

  const pageSize =
    numberOfLinodesWithMaintenance > infinitePageSize
      ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
      : infinitePageSize;
  const maxPageNumber = Math.ceil(count / pageSize);

  const search = useSearch({ strict: false });
  const queryPage = Math.min(Number(search.page), maxPageNumber) || 1;

  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  return (
    <Paginate
      data={data}
      page={queryPage}
      // If there are more Linodes with maintenance than the current page size, show the minimum
      // page size needed to show ALL Linodes with maintenance.
      pageSize={pageSize}
      pageSizeSetter={setInfinitePageSize}
      updatePageUrl={updatePageUrl}
    >
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => {
        const componentProps = {
          ...rest,
          count,
          data: paginatedData,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        };
        const tableWrapperProps = {
          dataLength: paginatedData.length,
          handleOrderChange,
          order,
          orderBy,
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
        };
        return (
          <React.Fragment>
            {display === 'list' && (
              <>
                {isGeckoLAEnabled && (
                  <Paper
                    sx={{ borderBottom: 0, padding: 1 }}
                    variant="outlined"
                  >
                    <RegionTypeFilter
                      handleRegionFilter={handleRegionFilter}
                      regionFilter={regionFilter}
                    />
                  </Paper>
                )}
                <TableWrapper
                  {...tableWrapperProps}
                  linodesAreGrouped={linodesAreGrouped}
                  linodeViewPreference={linodeViewPreference}
                  toggleGroupLinodes={toggleGroupLinodes}
                  toggleLinodeView={toggleLinodeView}
                >
                  <TableBody>
                    {filteredLinodesLoading ? (
                      <TableRowLoading columns={7} />
                    ) : (
                      <Component showHead {...componentProps} />
                    )}
                  </TableBody>
                </TableWrapper>
              </>
            )}
            {display === 'grid' && (
              <>
                <Grid className={'px0'} size={12}>
                  {isGeckoLAEnabled && (
                    <Paper
                      sx={{ borderBottom: 0, padding: 1 }}
                      variant="outlined"
                    >
                      <RegionTypeFilter
                        handleRegionFilter={handleRegionFilter}
                        regionFilter={regionFilter}
                      />
                    </Paper>
                  )}
                  <StyledControlHeader>
                    <div
                      className="visually-hidden"
                      id={displayViewDescriptionId}
                    >
                      Currently in {linodeViewPreference} view
                    </div>
                    <Box>
                      <Tooltip placement="top" title="List view">
                        <IconButton
                          aria-describedby={displayViewDescriptionId}
                          aria-label="Toggle display"
                          className="MuiIconButton-isActive"
                          disableRipple
                          onClick={toggleLinodeView}
                        >
                          <GridView />
                        </IconButton>
                      </Tooltip>
                      <div
                        className="visually-hidden"
                        id={groupByDescriptionId}
                      >
                        {linodesAreGrouped
                          ? 'group by tag is currently enabled'
                          : 'group by tag is currently disabled'}
                      </div>
                      <Tooltip placement="top-end" title="Group by tag">
                        <IconButton
                          aria-describedby={groupByDescriptionId}
                          aria-label="Toggle group by tag"
                          className={
                            linodesAreGrouped ? 'MuiIconButton-isActive' : ''
                          }
                          disableRipple
                          onClick={toggleGroupLinodes}
                          sx={(theme) => ({
                            ':hover': {
                              color: theme.tokens.color.Brand[60],
                            },
                            color:
                              theme.tokens.component.Table.HeaderNested.Icon,
                          })}
                        >
                          <GroupByTag />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledControlHeader>
                </Grid>
                {filteredLinodesLoading ? (
                  <CircleProgress />
                ) : (
                  <Component showHead {...componentProps} />
                )}
              </>
            )}
            <Grid size={12}>
              {
                <PaginationFooter
                  count={data.length}
                  eventCategory={'linodes landing'}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={queryPage}
                  pageSize={pageSize}
                  // Disabling showAll as it is impacting page performance.
                  showAll={false}
                  sx={{
                    border: 0,
                  }}
                />
              }
            </Grid>
          </React.Fragment>
        );
      }}
    </Paginate>
  );
});
