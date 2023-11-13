import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { IconButton } from 'src/components/IconButton';
import { InputAdornment } from 'src/components/InputAdornment';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';

import { CreateRouteDrawer } from './Routes/CreateRouteDrawer';
import { RoutesTable } from './Routes/RoutesTable';

import type { Filter } from '@linode/api-v4';

export const LoadBalancerRoutes = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [query, setQuery] = useState<string>();

  const filter: Filter = query ? { label: { '+contains': query } } : {};

  return (
    <>
      <Stack
        alignItems="flex-end"
        direction="row"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
        mb={2}
        mt={1.5}
      >
        <TextField
          InputProps={{
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear"
                  onClick={() => setQuery('')}
                  size="small"
                  sx={{ padding: 'unset' }}
                >
                  <CloseIcon sx={{ color: '#aaa !important' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          hideLabel
          label="Filter"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          style={{ minWidth: '320px' }}
          value={query}
        />
        <Button
          buttonType="primary"
          onClick={() => setIsCreateDrawerOpen(true)}
        >
          Create Route
        </Button>
      </Stack>
      <RoutesTable filter={filter} />
      <CreateRouteDrawer
        loadbalancerId={Number(loadbalancerId)}
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
    </>
  );
};
