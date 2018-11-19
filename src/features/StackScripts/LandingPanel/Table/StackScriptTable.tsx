import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import TableBody from '@material-ui/core/TableBody';

import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';

import TableHeader from './TableHeader';
import StackScriptTableRows from './TableRows';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  type: 'linode' | 'own' | 'community';
  count: number;
  error?: Error;
  loading: boolean;
  page: number;
  pageSize: number;
  data?: Linode.StackScript.Response[];
  orderBy?: string;
  order: 'asc' | 'desc';
  handlePageChange: (v: number, showSpinner?: boolean) => void;
  handlePageSizeChange: (v: number) => void;
  handleOrderChange: (key: string, order?: 'asc' | 'desc') => void;
  currentUser: string;
  triggerDelete: (stackScriptID: number, stackScriptLabel: string) => void;
  triggerMakePublic: (stackScriptID: number, stackScriptLabel: string) => void;
}

type CombinedProps = Props
  & WithStyles<ClassNames>

class StackScriptTable extends React.Component<CombinedProps, {}> {

  render() {
    const {
      page,
      pageSize,
      count,
      handlePageSizeChange,
      handlePageChange,
      handleOrderChange,
      data: stackScripts,
      loading,
      error,
      order,
      orderBy,
      currentUser,
      triggerDelete,
      triggerMakePublic
    } = this.props;

    return (
      <React.Fragment>
        <Table aria-label="List of StackScripts" border>
          <TableHeader
            sortOrder={order}
            currentFilter={orderBy}
            handleClick={handleOrderChange}
          />
          <TableBody>
            <StackScriptTableRows
              triggerDelete={triggerDelete}
              triggerMakePublic={triggerMakePublic}
              currentUser={currentUser}
              stackScript={{
                loading,
                error,
                stackScripts
              }}
            />
          </TableBody>
        </Table>
        {!loading && !error &&
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
          />
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(StackScriptTable);
