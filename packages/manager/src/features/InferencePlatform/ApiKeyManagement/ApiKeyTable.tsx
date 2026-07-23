import {
  useAllInferenceApiKeysQuery,
  useUpdateInferenceApiKeyMutation,
} from '@linode/queries';
import { Box, CircleProgress, ErrorState, Typography } from '@linode/ui';
import React, { useMemo, useState } from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table as LinodeTable } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
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
    if (!apiKeys) return [];
    return apiKeys.filter((row: ApiKey) => {
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
        row.allowed_models.some((model: string) =>
          model.toLowerCase().includes(lower)
        )
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

  const handleSort = (key: string) => {
    if (orderBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(key);
      setOrder('asc');
    }
  };

  // Helper to render a sortable table header cell
  const renderSortCell = (label: string, display: string) => (
    <TableSortCell
      active={orderBy === label}
      direction={order}
      handleClick={() => handleSort(label)}
      label={label}
    >
      {display}
    </TableSortCell>
  );

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
        <CircleProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return <ErrorState errorText="Failed to load API keys." />;
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
      <LinodeTable aria-label="API Keys">
        <TableHead>
          <TableRow>
            {renderSortCell('label', 'Name')}
            <TableCell>Key</TableCell>
            <TableCell>Status</TableCell>
            {renderSortCell('last_used', 'Last used')}
            <TableCell>Allowed Models</TableCell>
            {renderSortCell('expiry', 'Expires')}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {pagination.paginatedData.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
                  {key.label}
                  {key.key_type === 'playground' && (
                    <KeyTypeBadge keyType={key.key_type} />
                  )}
                </Box>
              </TableCell>
              <TableCell>{key.key_prefix}...</TableCell>
              <TableCell>
                <StatusBadge status={key.status} />
              </TableCell>
              <TableCell>
                {key.last_used ? (
                  <DateTimeDisplay humanizeCutoff="day" value={key.last_used} />
                ) : (
                  <Typography>Never</Typography>
                )}
              </TableCell>
              <TableCell>
                <ModelsPopover models={key.allowed_models} />
              </TableCell>
              <TableCell>
                <ExpiresDisplay expiry={key.expiry} />
              </TableCell>
              <TableCell>
                <ActionMenu
                  actionsList={getApiKeyActions(key)}
                  ariaLabel={key.label}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </LinodeTable>
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
