import { Volume } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import RenderVolumeData, {
  RenderVolumeDataProps
} from './RenderVolumeData_CMR';
import SortableVolumesTableHeader from './SortableVolumesTableHeader_CMR';
import { ExtendedVolume } from './types';

interface Props {
  data: Volume[];
  orderBy: string;
  order: 'asc' | 'desc';
  renderProps: RenderVolumeDataProps;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props;

const ListVolumes: React.FC<CombinedProps> = props => {
  const { orderBy, order, handleOrderChange, data, renderProps } = props;

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  const renderData = (volumes: ExtendedVolume[]) => {
    if (volumes.length < 1) {
      return renderEmpty();
    }
  };

  const renderEmpty = () => {};

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
              <TableBody>
                {renderData(paginatedData)}
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
