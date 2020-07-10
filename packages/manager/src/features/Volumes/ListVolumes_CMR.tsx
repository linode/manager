import { Volume } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { EntityError } from 'src/store/types';
import RenderVolumeData, {
  RenderVolumeDataProps
} from './RenderVolumeData_CMR';
import SortableVolumesTableHeader from './SortableVolumesTableHeader_CMR';
import { ExtendedVolume } from './types';

interface Props {
  data: Volume[];
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  order: 'asc' | 'desc';
  orderBy: string;
  renderProps: RenderVolumeDataProps;
  error?: string;
  volumesError?: EntityError;
}

type CombinedProps = Props;

const ListVolumes: React.FC<CombinedProps> = props => {
  const {
    data,
    handleOrderChange,
    order,
    orderBy,
    renderProps,
    error,
    volumesError
  } = props;

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  const renderData = (volumes: ExtendedVolume[]) => {
    if (error) {
      return <TableRowError colSpan={4} message={error} />;
    }

    if (volumesError && volumesError.read) {
      return (
        <TableRowError
          colSpan={4}
          message="There was an error loading your volumes."
        />
      );
    }

    if (volumes.length < 1) {
      return <TableRowEmptyState colSpan={4} />;
    }

    return <RenderVolumeData data={volumes} {...renderProps} />;
  };

  return (
    <Paginate
      data={data}
      pageSize={infinitePageSize}
      pageSizeSetter={setInfinitePageSize}
    >
      {({
        data: paginatedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => (
        <React.Fragment>
          <Paper>
            <Table
              removeLabelonMobile
              aria-label="List of your Volumes"
              rowCount={data.length}
              colCount={5}
            >
              <SortableVolumesTableHeader
                order={order}
                orderBy={orderBy}
                handleOrderChange={handleOrderChange}
                isVolumesLanding={renderProps.isVolumesLanding}
              />
              <TableBody>{renderData(paginatedData)}</TableBody>
            </Table>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="volumes landing"
            showAll
          />
        </React.Fragment>
      )}
    </Paginate>
  );
};

export default ListVolumes;
