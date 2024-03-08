import React from 'react';
import { useController } from 'react-hook-form';

import { SelectRegionPanel } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import { useGrants } from 'src/queries/profile';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Region = () => {
  const { field, formState } = useController<CreateLinodeRequest>({
    name: 'region',
  });

  const { data: grants } = useGrants();

  const hasCreateLinodePermission =
    grants === undefined || grants.global.add_linodes;

  return (
    <SelectRegionPanel
      currentCapability="Linodes"
      disabled={!hasCreateLinodePermission}
      error={formState.errors.region?.message}
      handleSelection={field.onChange}
      selectedId={field.value}
    />
  );
};
