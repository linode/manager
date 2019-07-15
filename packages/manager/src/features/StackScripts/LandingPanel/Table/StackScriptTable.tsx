import * as React from 'react';

import TableBody from 'src/components/core/TableBody';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';

import TableHeader from './TableHeader';
import StackScriptTableRows from './TableRows';

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

type CombinedProps = Props;

const StackScriptTable = (props: CombinedProps) => {
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
    triggerMakePublic,
    type
  } = props;

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
            category={type}
          />
        </TableBody>
      </Table>
      {!loading && !error && (
        <PaginationFooter
          count={count}
          page={page}
          pageSize={pageSize}
          handlePageChange={handlePageChange}
          handleSizeChange={handlePageSizeChange}
          eventCategory="stackscripts table"
        />
      )}
    </React.Fragment>
  );
};

export default StackScriptTable;
