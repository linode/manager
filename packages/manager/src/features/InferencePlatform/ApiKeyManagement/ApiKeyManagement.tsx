import {
  Button,
  Checkbox,
  Icon,
  Select,
  TextField,
} from '@akamai/cds-components/react';
import { Stack } from '@linode/ui';
import React from 'react';

import { ApiKeyTable } from './ApiKeyTable';
import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

import type { ApiKeyStatus } from '@linode/api-v4';

type StatusFilterOption = 'all' | ApiKeyStatus;

interface StatusOption {
  label: string;
  value: StatusFilterOption;
}

const statusOptions: StatusOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Revoked', value: 'revoked' },
];

export const ApiKeyManagement = () => {
  const [filter, setFilter] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilterOption>('all');
  const [showPlaygroundKeys, setShowPlaygroundKeys] = React.useState(true);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

  const selectedOption = statusOptions.find(
    (opt) => opt.value === statusFilter
  );

  return (
    <Stack direction="row" gap={3} sx={{ minHeight: 400 }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack alignItems="center" direction="row" gap={2}>
            <TextField
              onChange={(e) => setFilter(String(e.detail))}
              placeholder="Filter by name, key, models..."
              style={{ width: '300px' }}
              value={filter}
            />
            <Stack alignItems="center" direction="row" gap={1}>
              <span>Status</span>
              <Select<StatusOption>
                aria-label="Status"
                items={statusOptions}
                onChange={(event) => {
                  const option = event.detail as unknown as null | StatusOption;
                  if (option) {
                    setStatusFilter(option.value);
                  }
                }}
                selected={selectedOption}
                style={{ minWidth: '120px' }}
                valueFn={(item) => (item as StatusOption).label}
              />
            </Stack>
            <Checkbox
              checked={showPlaygroundKeys}
              onChange={(e) =>
                setShowPlaygroundKeys((e as CustomEvent<boolean>).detail)
              }
            >
              Show playground keys
            </Checkbox>
          </Stack>
          <Button onClick={() => setIsCreateDrawerOpen(true)} variant="primary">
            <Icon icon="add" size="s" />
            Create API Key
          </Button>
        </Stack>
        <ApiKeyTable
          filter={filter}
          showPlaygroundKeys={showPlaygroundKeys}
          statusFilter={statusFilter}
        />
      </Stack>
      <CreateApiKeyDrawer
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
    </Stack>
  );
};
