import { Config } from '@linode/api-v4/lib/linodes';
import { compose } from 'ramda';
import * as React from 'react';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import GridView from 'src/assets/icons/grid-view.svg';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { Box } from 'src/components/Box';
import {
  MIN_PAGE_SIZE,
  PaginationFooter,
  getMinimumPageSizeForNumberOfItems,
} from 'src/components/PaginationFooter/PaginationFooter';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/Linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import TableWrapper from './TableWrapper';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { RenderLinodesProps } from './DisplayLinodes';
import {
  StyledControlHeader,
  StyledTagHeader,
  StyledTagHeaderRow,
  StyledToggleButton,
} from './DisplayLinodes.styles';

interface Props {
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  display: 'grid' | 'list';
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  someLinodesHaveMaintenance: boolean;
  toggleLinodeView: () => 'grid' | 'list';
  toggleGroupLinodes: () => boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  isVLAN?: boolean;
}

type CombinedProps = Props & OrderByProps<LinodeWithMaintenance>;

export const DisplayGroupedLinodes = (props: CombinedProps) => {
  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    toggleLinodeView,
    toggleGroupLinodes,
    linodeViewPreference,
    linodesAreGrouped,
    isVLAN,
    ...rest
  } = props;

  const dataLength = data.length;

  const orderedGroupedLinodes = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = {
    handleOrderChange,
    order,
    orderBy,
    someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
    dataLength,
    isVLAN,
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
        <Grid xs={12} className={'px0'}>
          <StyledControlHeader isGroupedByTag={linodesAreGrouped}>
            <div id="displayViewDescription" className="visually-hidden">
              Currently in {linodeViewPreference} view
            </div>
            <Tooltip placement="top" title="List view">
              <StyledToggleButton
                aria-label="Toggle display"
                aria-describedby={'displayViewDescription'}
                onClick={toggleLinodeView}
                disableRipple
                isActive={linodesAreGrouped}
                size="large"
              >
                <GridView />
              </StyledToggleButton>
            </Tooltip>

            <div id="groupByDescription" className="visually-hidden">
              {linodesAreGrouped
                ? 'group by tag is currently enabled'
                : 'group by tag is currently disabled'}
            </div>
            <Tooltip placement="top-end" title="Ungroup by tag">
              <StyledToggleButton
                aria-label={`Toggle group by tag`}
                aria-describedby={'groupByDescription'}
                onClick={toggleGroupLinodes}
                disableRipple
                isActive={linodesAreGrouped}
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
            <Box key={tag} sx={{ marginBottom: 2 }} data-qa-tag-header={tag}>
              <Grid container>
                <Grid xs={12}>
                  <StyledTagHeader variant="h2">{tag}</StyledTagHeader>
                </Grid>
              </Grid>
              <Paginate
                data={linodes}
                // If there are more Linodes with maintenance than the current page size, show the minimum
                // page size needed to show ALL Linodes with maintenance.
                pageSize={
                  numberOfLinodesWithMaintenance > infinitePageSize
                    ? getMinimumPageSizeForNumberOfItems(
                        numberOfLinodesWithMaintenance
                      )
                    : infinitePageSize
                }
                pageSizeSetter={setInfinitePageSize}
              >
                {({
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                  count,
                }) => {
                  const finalProps = {
                    ...rest,
                    data: paginatedData,
                    pageSize,
                    page,
                    handlePageSizeChange,
                    handlePageChange,
                    handleOrderChange,
                    order,
                    orderBy,
                    isVLAN,
                    count,
                  };
                  return (
                    <React.Fragment>
                      <Component {...finalProps} />
                      <Grid xs={12}>
                        <PaginationFooter
                          count={count}
                          handlePageChange={handlePageChange}
                          handleSizeChange={handlePageSizeChange}
                          pageSize={pageSize}
                          page={page}
                          eventCategory={'linodes landing'}
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
        toggleLinodeView={toggleLinodeView}
        toggleGroupLinodes={toggleGroupLinodes}
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
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                  count,
                }) => {
                  const finalProps = {
                    ...rest,
                    data: paginatedData,
                    pageSize,
                    page,
                    handlePageSizeChange,
                    handlePageChange,
                    handleOrderChange,
                    order,
                    orderBy,
                    isVLAN,
                    count,
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
                              handlePageChange={handlePageChange}
                              handleSizeChange={handlePageSizeChange}
                              pageSize={pageSize}
                              page={page}
                              eventCategory={'linodes landing'}
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

export default DisplayGroupedLinodes;
