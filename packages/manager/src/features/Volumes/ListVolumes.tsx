import { Volume } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import RenderVolumeData, { RenderVolumeDataProps } from './RenderVolumeData';
import SortableVolumesTableHeader from './SortableVolumesTableHeader';

interface Props {
  data: Volume[];
  orderBy: string;
  order: 'asc' | 'desc';
  renderProps: RenderVolumeDataProps;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props;

const ListVolumes: React.FC<CombinedProps> = (props) => {
  const { orderBy, order, handleOrderChange, data, renderProps } = props;

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

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
        pageSize,
      }) => (
        <React.Fragment>
          <Paper>
            <Table
              aria-label="List of your Volumes"
              colCount={5}
              rowCount={data.length}
            >
              <SortableVolumesTableHeader
                order={order}
                orderBy={orderBy}
                handleOrderChange={handleOrderChange}
                isVolumesLanding={renderProps.isVolumesLanding}
              />
              <TableBody>
                <RenderVolumeData data={paginatedData} {...renderProps} />
              </TableBody>
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
