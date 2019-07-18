import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import RenderVolumeData, { RenderVolumeDataProps } from './RenderVolumeData';
import SortableVolumesTableHeader from './SortableVolumesTableHeader';

interface Props {
  data: Linode.Volume[];
  orderBy: string;
  order: 'asc' | 'desc';
  renderProps: RenderVolumeDataProps;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props;

const ListVolumes: React.StatelessComponent<CombinedProps> = props => {
  const { orderBy, order, handleOrderChange, data, renderProps } = props;
  return (
    <Paginate data={data} pageSize={25}>
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
            <Table removeLabelonMobile aria-label="List of your Volumes">
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
          />
        </React.Fragment>
      )}
    </Paginate>
  );
};

export default ListVolumes;
