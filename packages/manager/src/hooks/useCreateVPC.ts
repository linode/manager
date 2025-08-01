import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from '@linode/api-v4';
import {
  useCreateVPCMutation,
  useGrants,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import {
  getQueryParamsFromQueryString,
  scrollErrorIntoView,
} from '@linode/utilities';
import { createVPCSchema } from '@linode/validation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';

import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { DEFAULT_SUBNET_IPV4_VALUE } from 'src/utilities/subnets';

import type { CreateVPCPayload, VPC } from '@linode/api-v4';
import type { LinodeCreateType } from '@linode/utilities';

// Custom hook to consolidate shared logic between VPCCreate.tsx and VPCCreateDrawer.tsx
export interface UseCreateVPCInputs {
  handleSelectVPC?: (vpc: VPC) => void;
  onDrawerClose?: () => void;
  pushToVPCPage?: boolean;
  selectedRegion?: string;
}

export const useCreateVPC = (inputs: UseCreateVPCInputs) => {
  const { handleSelectVPC, onDrawerClose, pushToVPCPage, selectedRegion } =
    inputs;

  const previousSubmitCount = React.useRef<number>(0);

  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const userCannotAddVPC = profile?.restricted && !grants?.global.add_vpcs;

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString(location.search);

  const { data: regions } = useRegionsQuery();
  const regionsData = regions ?? [];

  const { isPending: isLoadingCreateVPC, mutateAsync: createVPC } =
    useCreateVPCMutation();

  const onCreateVPC = async (values: CreateVPCPayload) => {
    try {
      const vpc = await createVPC(values);
      if (pushToVPCPage) {
        history.push(`/vpcs/${vpc.id}`);
      } else {
        if (handleSelectVPC && onDrawerClose) {
          handleSelectVPC(vpc);
          onDrawerClose();
          form.reset();
        }
      }

      // Fire analytics form submit upon successful VPC creation from Linode Create flow.
      if (isFromLinodeCreate) {
        sendLinodeCreateFormStepEvent({
          createType: (queryParams.type as LinodeCreateType) ?? 'OS',
          headerName: 'Create VPC',
          interaction: 'click',
          label: 'Create VPC',
        });
      }
    } catch (errors) {
      for (const error of errors) {
        if (error?.field === 'subnets.label') {
          form.setError('root.subnetLabel', { message: error.reason });
        } else if (error?.field === 'subnets.ipv4') {
          form.setError('root.subnetIPv4', { message: error.reason });
        } else {
          form.setError(error?.field ?? 'root', { message: error.reason });
        }
      }
    }
  };

  const defaultValues = {
    description: '',
    label: '',
    region: selectedRegion ?? '',
    subnets: [
      {
        ipv4: DEFAULT_SUBNET_IPV4_VALUE,
        label: '',
      },
    ],
  };

  const form = useForm<CreateVPCPayload>({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(createVPCSchema),
    values: { ...defaultValues },
  });

  const { errors, submitCount } = form.formState;

  React.useEffect(() => {
    if (!isEmpty(errors) && submitCount > previousSubmitCount.current) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
    previousSubmitCount.current = submitCount;
  }, [errors, submitCount]);

  return {
    form,
    isLoadingCreateVPC,
    onCreateVPC,
    regionsData,
    userCannotAddVPC,
  };
};
