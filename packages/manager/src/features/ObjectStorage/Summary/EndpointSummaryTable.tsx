import React, { useEffect, useState } from 'react';

import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';

import { EndpointSummaryRow } from './EndpointSummaryRow';

import type { ObjectStorageEndpoint } from '@linode/api-v4';

interface Props {
  endpoints: ObjectStorageEndpoint[];
}

const PAGE_SIZE = 5;

export const EndpointSummaryTable = ({ endpoints }: Props) => {
  const [page, setPage] = useState(1);
  const [paginatedEndpoints, setPaginatedEndpoints] = useState<
    ObjectStorageEndpoint[]
  >([]);

  useEffect(() => {
    const offset = PAGE_SIZE * (page - 1);
    setPaginatedEndpoints(endpoints.slice(offset, offset + PAGE_SIZE));

    if (endpoints.length <= offset) {
      setPage(page - 1);
    }
  }, [endpoints, page]);

  return (
    <>
      <div
        data-testid="table-endpoint-summary"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--token-global-spacing-s24)',
        }}
      >
        {paginatedEndpoints.map((endpoint, index) => {
          return <EndpointSummaryRow endpoint={endpoint} key={index} />;
        })}
      </div>

      <PaginationFooter
        count={endpoints.length}
        eventCategory="Endpoints Table"
        fixedSize={true}
        handlePageChange={setPage}
        handleSizeChange={() => {}}
        page={page}
        pageSize={PAGE_SIZE}
        sx={{ padding: 0, border: 'none' }}
      />
    </>
  );
};
