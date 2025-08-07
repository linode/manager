import { useAllTypes, useRegionsQuery } from '@linode/queries';
import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PlansPanel } from 'src/features/components/PlansPanel/PlansPanel';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { sendLinodeCreateFlowDocsClickEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { extendType } from 'src/utilities/extendType';

import { useGetLinodeCreateType } from './Tabs/utils/useGetLinodeCreateType';

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
  const createType = useGetLinodeCreateType();

  const { data: permissions } = usePermissions('account', ['create_linode']);

  return (
    <PlansPanel
      data-qa-select-plan
      disabled={!permissions.create_linode}
      docsLink={
        <DocsLink
          href="https://techdocs.akamai.com/cloud-computing/docs/how-to-choose-a-compute-instance-plan"
          label="Choosing a Plan"
          onClick={() => {
            sendLinodeCreateFlowDocsClickEvent('Choosing a Plan');
            sendLinodeCreateFormInputEvent({
              createType: createType ?? 'OS',
              headerName: 'Linode Plan',
              interaction: 'click',
              label: 'Choosing a Plan',
            });
          }}
        />
      }
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
