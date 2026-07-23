import { Autocomplete, Button, Checkbox, Stack, TextField } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import Add from 'src/assets/icons/add.svg';

import { ApiKeyTable } from './ApiKeyTable';
import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

import type { ApiKeyStatus } from '@linode/api-v4';

type StatusFilterOption = 'all' | ApiKeyStatus;

const statusOptions: { label: string; value: StatusFilterOption }[] = [
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

  return (
    <Stack direction="row" gap={3} sx={{ minHeight: 400 }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack alignItems="center" direction="row" gap={2}>
            <TextField
              hideLabel
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name, ID, key, models..."
              sx={{ width: 300 }}
              value={filter}
            />
            <Stack alignItems="center" direction="row" gap={1}>
              <span>Status</span>
              <Autocomplete
                disableClearable
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                label="Status"
                onChange={(_, value) => setStatusFilter(value?.value ?? 'all')}
                options={statusOptions}
                sx={{ minWidth: 120 }}
                textFieldProps={{ hideLabel: true }}
                value={statusOptions.find((opt) => opt.value === statusFilter)}
              />
            </Stack>
            <Checkbox
              checked={showPlaygroundKeys}
              onChange={(e) => setShowPlaygroundKeys(e.target.checked)}
              sx={{ whiteSpace: 'nowrap' }}
              text="Show playground keys"
            />
          </Stack>
          <Button
            buttonType="primary"
            onClick={() => setIsCreateDrawerOpen(true)}
            startIcon={<StyledAddIcon />}
          >
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

const StyledAddIcon = styled(Add)(() => ({
  height: 16,
  width: 16,
}));
