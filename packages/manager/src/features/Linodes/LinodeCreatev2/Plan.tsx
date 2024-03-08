import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { useGrants } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useAllTypes } from 'src/queries/types';
import { sendLinodeCreateFlowDocsClickEvent } from 'src/utilities/analytics';
import { extendType } from 'src/utilities/extendType';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Plan = () => {
  const { watch } = useFormContext<CreateLinodeRequest>();
  const { field, fieldState } = useController<CreateLinodeRequest>({
    name: 'type',
  });

  const { data: grants } = useGrants();
  const { data: regions } = useRegionsQuery();
  const { data: types } = useAllTypes();

  const regionId = watch('region');

  const hasCreateLinodePermission =
    grants === undefined || grants.global.add_linodes;

  return (
    <PlansPanel
      docsLink={
        <DocsLink
          onClick={() => {
            sendLinodeCreateFlowDocsClickEvent('Choosing a Plan');
          }}
          href="https://www.linode.com/docs/guides/choosing-a-compute-instance-plan/"
          label="Choosing a Plan"
        />
      }
      data-qa-select-plan
      disabled={!hasCreateLinodePermission}
      error={fieldState.error?.message}
      isCreate
      linodeID={undefined} // @todo add cloning support
      onSelect={field.onChange}
      regionsData={regions} // @todo move this query deeper if possible
      selectedId={field.value}
      selectedRegionID={regionId}
      showTransfer
      types={types?.map(extendType) ?? []}
    />
  );
};
