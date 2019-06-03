import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import NodeBalancersLandingTableRows from './NodeBalancersLandingTableRows';
import NodeBalancersTableWrapper from './NodeBalancersTableWrapper';

type ClassNames =
  | 'ip'
  | 'nameCell'
  | 'nodeStatus'
  | 'nodeStatus'
  | 'ports'
  | 'tagGroup'
  | 'title'
  | 'transferred';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ip: { width: '30%', minWidth: 200 },
  nameCell: { width: '15%', minWidth: 150 },
  nodeStatus: { width: '10%', minWidth: 100 },
  ports: { width: '10%', minWidth: 50 },
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing(1) - 2
  },
  title: { marginBottom: theme.spacing(2) },
  transferred: { width: '10%', minWidth: 100 }
});

interface Props {
  data: Linode.NodeBalancerWithConfigs[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  toggleDialog: (id: number, label: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListNodeBalancers: React.StatelessComponent<CombinedProps> = props => {
  const { data, orderBy, order, handleOrderChange, toggleDialog } = props;
  const tableWrapperProps = { handleOrderChange, order, orderBy };

  return (
    <Paginate data={data}>
      {({
        count,
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => (
        <>
          <Paper>
            <NodeBalancersTableWrapper {...tableWrapperProps}>
              <TableBody>
                <NodeBalancersLandingTableRows
                  toggleDialog={toggleDialog}
                  data={paginatedData}
                />
              </TableBody>
            </NodeBalancersTableWrapper>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="nodebalancers landing"
          />
        </>
      )}
    </Paginate>
  );
};

const styled = withStyles(styles);

export default styled(ListNodeBalancers);
