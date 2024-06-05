import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useAllTypes } from 'src/queries/types';
import { sendLinodeCreateFlowDocsClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { extendType } from 'src/utilities/extendType';

import type { LinodeCreateFormValues } from './utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

export const Plan = () => {
  const regionId = useWatch<CreateLinodeRequest, 'region'>({ name: 'region' });
  const linode = useWatch<LinodeCreateFormValues, 'linode'>({ name: 'linode' });

  const { field, fieldState } = useController<CreateLinodeRequest>({
    name: 'type',
  });

  const { data: regions } = useRegionsQuery();
  const { data: types } = useAllTypes();

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

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
      disabled={isLinodeCreateRestricted}
      error={fieldState.error?.message}
      isCreate
      linodeID={linode?.id}
      onSelect={field.onChange}
      regionsData={regions} // @todo move this query deeper if possible
      selectedId={field.value}
      selectedRegionID={regionId}
      showLimits
      types={types?.map(extendType) ?? []} // @todo don't extend type
    />
  );
};
