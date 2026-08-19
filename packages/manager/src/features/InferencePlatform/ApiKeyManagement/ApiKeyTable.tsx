import {
  LoadingSpinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextOverflow,
  ZeroErrorIcon,
  ZeroErrorState,
  ZeroErrorTitle,
} from '@akamai/cds-components/react';
import {
  useAllInferenceApiKeysQuery,
  useUpdateInferenceApiKeyMutation,
} from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import React, { useMemo, useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { ApiKeyDetailsDrawer } from './ApiKeyDetailsDrawer';
import { KeyTypeBadge } from './KeyTypeBadge';
import { ModelsPopover } from './ModelsPopover';
import { RevokeApiKeyDialog } from './RevokeApiKeyDialog';
import { StatusBadge } from './StatusBadge';

import type { ApiKey, ApiKeyStatus } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

type StatusFilterOption = 'all' | ApiKeyStatus;

const ExpiresDisplay = ({ expiry }: { expiry: null | string }) => {
  if (!expiry) {
    return <Typography>Never</Typography>;
  }

  return <DateTimeDisplay humanizeCutoff="month" value={expiry} />;
};

interface ApiKeyTableProps {
  filter: string;
  showPlaygroundKeys?: boolean;
  statusFilter?: StatusFilterOption;
}

const COLUMN_WIDTHS = {
  actions: '3%',
  allowedModels: '12%',
  expires: '14%',
  key: '12%',
  lastUsed: '14%',
  name: '30%',
  status: '10%',
};

const TABLE_CELL_BASE_STYLE = {
  boxSizing: 'border-box' as const,
};

/**
 * Generates consistent cell styles for table columns.
 * @param column - The column key from COLUMN_WIDTHS
 * @param options - Additional style options
 */
const getCellStyle = (
  column: keyof typeof COLUMN_WIDTHS,
  options?: {
    truncate?: boolean;
    whiteSpace?: 'normal' | 'nowrap';
  }
): React.CSSProperties => ({
  ...(options?.truncate && {
    maxWidth: COLUMN_WIDTHS[column],
    overflow: 'hidden',
  }),
  minWidth: COLUMN_WIDTHS[column],
  ...(options?.whiteSpace && { whiteSpace: options.whiteSpace }),
  ...TABLE_CELL_BASE_STYLE,
});

export const ApiKeyTable = ({
  filter,
  showPlaygroundKeys = true,
  statusFilter = 'all',
}: ApiKeyTableProps) => {
  const [orderBy, setOrderBy] = useState('label');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);

  // Use React Query for data fetching - provides caching, automatic refetching, and cross-component sync
  // Uses getAll utility to fetch all pages for client-side pagination
  const {
    data: apiKeys = [],
    error,
    isLoading,
  } = useAllInferenceApiKeysQuery();

  const { mutateAsync: updateApiKey } = useUpdateInferenceApiKeyMutation();

  const handleOpenDetails = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setDetailsDrawerOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDrawerOpen(false);
  };

  const handleOpenRevoke = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setRevokeDialogOpen(true);
  };

  const handleCloseRevoke = () => {
    setRevokeDialogOpen(false);
  };

  const getApiKeyActions = (apiKey: ApiKey): Action[] => {
    const actions: Action[] = [
      {
        onClick: () => handleOpenDetails(apiKey),
        title: 'Details',
      },
    ];

    if (apiKey.status !== 'revoked') {
      actions.push({
        onClick: () => handleOpenRevoke(apiKey),
        title: 'Revoke key',
      });
    }

    return actions;
  };

  const handleSaveApiKey = (
    keyId: number,
    updates: {
      allowedModels: string[];
      description: string;
      label: string;
    }
  ) => {
    updateApiKey({
      data: {
        allowed_models: updates.allowedModels,
        description: updates.description,
        label: updates.label,
      },
      keyId,
    });
  };

  // Pagination setup - must be called before any conditional returns
  const apiKeysUrl = '/inference-platform/api-key-management';
  const API_KEYS_TABLE_PREFERENCE_KEY = 'api-keys-table';

  const filteredKeys = useMemo(() => {
    if (!apiKeys || !Array.isArray(apiKeys)) {
      return [];
    }
    return apiKeys.filter((row) => {
      // Filter out playground keys if checkbox is unchecked
      if (!showPlaygroundKeys && row.key_type === 'playground') {
        return false;
      }

      // Filter by status
      if (statusFilter !== 'all' && row.status !== statusFilter) {
        return false;
      }

      if (!filter) return true;
      const lower = filter.toLowerCase();
      return (
        row.label.toLowerCase().includes(lower) ||
        row.key_prefix.toLowerCase().includes(lower) ||
        String(row.id).includes(lower) ||
        row.status.toLowerCase().includes(lower) ||
        row.allowed_models.some((model) => model.toLowerCase().includes(lower))
      );
    });
  }, [apiKeys, filter, showPlaygroundKeys, statusFilter]);

  // Sort the filtered array
  const sortedKeys = useMemo(() => {
    return [...filteredKeys].sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a] ?? '';
      const bValue = b[orderBy as keyof typeof b] ?? '';
      if (aValue === bValue) return 0;
      if (order === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [filteredKeys, orderBy, order]);

  // Generate dynamic page size options based on total count
  const pageSizeOptions = useMemo(() => {
    const count = sortedKeys.length;
    // Filter options to only show sizes smaller than total count
    const options = [10, 25, 50, 100, 250]
      .filter((size) => size < count)
      .map((size) => ({
        label: `Show ${size}`,
        value: size,
      }));

    // Always add an "All" option if there are items
    if (count > 0) {
      options.push({ label: `Show All (${count})`, value: count });
    }

    // Ensure we have at least the minimum option
    if (options.length === 0) {
      options.push({ label: 'Show 10', value: 10 });
    }

    return options;
  }, [sortedKeys.length]);

  const pagination = usePaginationV2({
    clientSidePaginationData: sortedKeys,
    currentRoute: apiKeysUrl,
    defaultPageSize: 10,
    preferenceKey: API_KEYS_TABLE_PREFERENCE_KEY,
  });

  const handleSort = (event: CustomEvent, key: string) => {
    setOrderBy(key);
    setOrder(event.detail as 'asc' | 'desc');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <LoadingSpinner data-testid="loading-spinner" />
      </Box>
    );
  }

  // Error state
  if (error) {
    let errorMessage = 'Failed to load API keys. Please try again.';
    if (Array.isArray(error) && error[0]?.reason) {
      errorMessage = error[0].reason;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return (
      <ZeroErrorState>
        <ZeroErrorIcon icon="error-cloud" />
        <ZeroErrorTitle>{errorMessage}</ZeroErrorTitle>
      </ZeroErrorState>
    );
  }

  // Empty state
  if (apiKeys.length === 0) {
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography>No API keys found. Create one to get started.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          // The CDS cell is a flex container, so the tallest child drives row
          // height. ActionMenu's IconButton ships `padding: 10px` around a
          // 24px kebab icon (44px), which pushed rows to ~64px. Scoped here so
          // the shared ActionMenu is unaffected elsewhere.
          '& cds-table-cell .MuiIconButton-root': {
            height: 'auto',
            paddingBottom: 0,
            paddingTop: 0,
          },
          overflowX: 'auto',
        }}
      >
        <Table
          aria-label="API Keys"
          style={{
            border: '1px solid var(--token-alias-border-normal)',
          }}
        >
          <TableHead>
            <TableRow headerborder>
              <TableHeaderCell
                onSort={(event) => handleSort(event, 'label')}
                sortable
                sorted={orderBy === 'label' ? order : undefined}
                style={getCellStyle('name')}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell style={getCellStyle('key')}>Key</TableHeaderCell>
              <TableHeaderCell style={getCellStyle('status')}>
                Status
              </TableHeaderCell>
              <TableHeaderCell
                onSort={(event) => handleSort(event, 'last_used')}
                sortable
                sorted={orderBy === 'last_used' ? order : undefined}
                style={getCellStyle('lastUsed', { whiteSpace: 'nowrap' })}
              >
                Last used
              </TableHeaderCell>
              <TableHeaderCell
                style={getCellStyle('allowedModels', { whiteSpace: 'nowrap' })}
              >
                Allowed Models
              </TableHeaderCell>
              <TableHeaderCell
                onSort={(event) => handleSort(event, 'expiry')}
                sortable
                sorted={orderBy === 'expiry' ? order : undefined}
                style={getCellStyle('expires')}
              >
                Expires
              </TableHeaderCell>
              <TableHeaderCell style={getCellStyle('actions')} />
            </TableRow>
          </TableHead>
          <TableBody>
            {pagination.paginatedData.map((key) => (
              <TableRow hoverable key={key.id} rowborder zebra>
                <TableCell style={getCellStyle('name', { truncate: true })}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <TextOverflow style={{ flex: 1, minWidth: 0 }}>
                      {key.label}
                    </TextOverflow>
                    {key.key_type === 'playground' && (
                      <KeyTypeBadge keyType={key.key_type} />
                    )}
                  </Box>
                </TableCell>
                <TableCell style={getCellStyle('key')}>
                  {key.key_prefix}...
                </TableCell>
                <TableCell style={getCellStyle('status')}>
                  <StatusBadge status={key.status} />
                </TableCell>
                <TableCell style={getCellStyle('lastUsed')}>
                  {key.last_used ? (
                    <DateTimeDisplay
                      humanizeCutoff="day"
                      value={key.last_used}
                    />
                  ) : (
                    <Typography>Never</Typography>
                  )}
                </TableCell>
                <TableCell style={getCellStyle('allowedModels')}>
                  <ModelsPopover models={key.allowed_models} />
                </TableCell>
                <TableCell style={getCellStyle('expires')}>
                  <ExpiresDisplay expiry={key.expiry} />
                </TableCell>
                <TableCell style={getCellStyle('actions')}>
                  <ActionMenu
                    actionsList={getApiKeyActions(key)}
                    ariaLabel={key.label}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <PaginationFooter
        count={sortedKeys.length}
        customOptions={pageSizeOptions}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        minPageSize={10}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <ApiKeyDetailsDrawer
        apiKey={selectedApiKey}
        onClose={handleCloseDetails}
        onSave={handleSaveApiKey}
        open={detailsDrawerOpen}
      />
      <RevokeApiKeyDialog
        apiKey={selectedApiKey}
        onClose={handleCloseRevoke}
        open={revokeDialogOpen}
      />
    </Box>
  );
};
