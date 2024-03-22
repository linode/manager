import React from 'react';
import { useController } from 'react-hook-form';

import { SelectRegionPanel } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Region = () => {
  const { field, formState } = useController<CreateLinodeRequest>({
    name: 'region',
  });

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <SelectRegionPanel
      currentCapability="Linodes"
      disabled={isLinodeCreateRestricted}
      error={formState.errors.region?.message}
      handleSelection={field.onChange}
      selectedId={field.value}
    />
  );
};
