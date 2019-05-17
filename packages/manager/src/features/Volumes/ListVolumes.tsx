import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import RenderVolumeData, { RenderVolumeDataProps } from './RenderVolumeData';
import SortableVolumesTableHeader from './SortableVolumesTableHeader';

type ClassNames = 'root' | 'volumesWrapper' | 'linodeVolumesWrapper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  // styles for /volumes table
  volumesWrapper: {},
  // styles for linodes/id/volumes table
  linodeVolumesWrapper: {}
});

interface Props {
  data: Linode.Volume[];
  orderBy: string;
  order: 'asc' | 'desc';
  renderProps: RenderVolumeDataProps;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListVolumes: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    orderBy,
    order,
    handleOrderChange,
    data,
    renderProps
  } = props;
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
            <Table
              removeLabelonMobile
              aria-label="List of your Volumes"
              className={
                renderProps.isVolumesLanding
                  ? classes.volumesWrapper
                  : classes.linodeVolumesWrapper
              }
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
          />
        </React.Fragment>
      )}
    </Paginate>
  );
};

const styled = withStyles(styles);

export default styled(ListVolumes);
