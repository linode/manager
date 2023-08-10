import { Config } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { compose } from 'ramda';
import * as React from 'react';

import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import { Box } from 'src/components/Box';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import {
  MIN_PAGE_SIZE,
  PaginationFooter,
  getMinimumPageSizeForNumberOfItems,
} from 'src/components/PaginationFooter/PaginationFooter';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/Linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

import { RenderLinodesProps } from './DisplayLinodes';
import {
  StyledControlHeader,
  StyledTagHeader,
  StyledTagHeaderRow,
  StyledToggleButton,
} from './DisplayLinodes.styles';
import TableWrapper from './TableWrapper';

interface Props {
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  display: 'grid' | 'list';
  isVLAN?: boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  someLinodesHaveMaintenance: boolean;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
}

type CombinedProps = Props & OrderByProps<LinodeWithMaintenance>;

export const DisplayGroupedLinodes = (props: CombinedProps) => {
  const {
    component: Component,
    data,
    display,
    handleOrderChange,
    isVLAN,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    toggleGroupLinodes,
    toggleLinodeView,
    ...rest
  } = props;

  const dataLength = data.length;

  const orderedGroupedLinodes = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = {
    dataLength,
    handleOrderChange,
    isVLAN,
    order,
    orderBy,
    someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
  };

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();
  const numberOfLinodesWithMaintenance = data.reduce((acc, thisLinode) => {
    if (thisLinode.maintenance) {
      acc++;
    }
    return acc;
  }, 0);

  if (display === 'grid') {
    return (
      <>
        <Grid className={'px0'} xs={12}>
          <StyledControlHeader isGroupedByTag={linodesAreGrouped}>
            <div className="visually-hidden" id="displayViewDescription">
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="List view">
              <StyledToggleButton
                aria-describedby={'displayViewDescription'}
                aria-label="Toggle display"
                disableRipple
                isActive={linodesAreGrouped}
                onClick={toggleLinodeView}
                size="large"
              >
                <GridView />
              </StyledToggleButton>
            </Tooltip>

            <div className="visually-hidden" id="groupByDescription">
              {linodesAreGrouped
                ? 'group by tag is currently enabled'
                : 'group by tag is currently disabled'}
            </div>
            <Tooltip placement="top-end" title="Ungroup by tag">
              <StyledToggleButton
                aria-describedby={'groupByDescription'}
                aria-label={`Toggle group by tag`}
                disableRipple
                isActive={linodesAreGrouped}
                onClick={toggleGroupLinodes}
                size="large"
              >
                <GroupByTag />
              </StyledToggleButton>
            </Tooltip>
          </StyledControlHeader>
        </Grid>
        {orderedGroupedLinodes.length === 0 ? (
          <Typography style={{ textAlign: 'center' }}>
            No items to display.
          </Typography>
        ) : null}
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <Box data-qa-tag-header={tag} key={tag} sx={{ marginBottom: 2 }}>
              <Grid container>
                <Grid xs={12}>
                  <StyledTagHeader variant="h2">{tag}</StyledTagHeader>
                </Grid>
              </Grid>
              <Paginate
                // page size needed to show ALL Linodes with maintenance.
                pageSize={
                  numberOfLinodesWithMaintenance > infinitePageSize
                    ? getMinimumPageSizeForNumberOfItems(
                        numberOfLinodesWithMaintenance
                      )
                    : infinitePageSize
                }
                // If there are more Linodes with maintenance than the current page size, show the minimum
                data={linodes}
                pageSizeSetter={setInfinitePageSize}
              >
                {({
                  count,
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                }) => {
                  const finalProps = {
                    ...rest,
                    count,
                    data: paginatedData,
                    handleOrderChange,
                    handlePageChange,
                    handlePageSizeChange,
                    isVLAN,
                    order,
                    orderBy,
                    page,
                    pageSize,
                  };
                  return (
                    <React.Fragment>
                      <Component {...finalProps} />
                      <Grid xs={12}>
                        <PaginationFooter
                          count={count}
                          eventCategory={'linodes landing'}
                          handlePageChange={handlePageChange}
                          handleSizeChange={handlePageSizeChange}
                          page={page}
                          pageSize={pageSize}
                          showAll
                        />
                      </Grid>
                    </React.Fragment>
                  );
                }}
              </Paginate>
            </Box>
          );
        })}
      </>
    );
  }

  if (display === 'list') {
    return (
      <TableWrapper
        {...tableWrapperProps}
        linodeViewPreference="list"
        linodesAreGrouped={true}
        toggleGroupLinodes={toggleGroupLinodes}
        toggleLinodeView={toggleLinodeView}
      >
        {orderedGroupedLinodes.length === 0 ? (
          <TableBody>
            <TableRowEmpty colSpan={12} />
          </TableBody>
        ) : null}
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <React.Fragment key={tag}>
              <Paginate
                data={linodes}
                pageSize={infinitePageSize}
                pageSizeSetter={setInfinitePageSize}
              >
                {({
                  count,
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                }) => {
                  const finalProps = {
                    ...rest,
                    count,
                    data: paginatedData,
                    handleOrderChange,
                    handlePageChange,
                    handlePageSizeChange,
                    isVLAN,
                    order,
                    orderBy,
                    page,
                    pageSize,
                  };
                  return (
                    <TableBody data-qa-tag-header={tag}>
                      <StyledTagHeaderRow>
                        <TableCell colSpan={7}>
                          <StyledTagHeader variant="h2">{tag}</StyledTagHeader>
                        </TableCell>
                      </StyledTagHeaderRow>
                      <Component {...finalProps} />
                      {count > MIN_PAGE_SIZE && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ padding: 0 }}>
                            <PaginationFooter
                              count={count}
                              eventCategory={'linodes landing'}
                              handlePageChange={handlePageChange}
                              handleSizeChange={handlePageSizeChange}
                              page={page}
                              pageSize={pageSize}
                              // Disabling showAll as it is impacting page performance.
                              showAll={false}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  );
                }}
              </Paginate>
            </React.Fragment>
          );
        })}
      </TableWrapper>
    );
  }

  return null;
};
