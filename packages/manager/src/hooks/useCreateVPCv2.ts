import { yupResolver } from '@hookform/resolvers/yup';
import { createVPCSchema } from '@linode/validation';
import { useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';

import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs/vpcs';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { DEFAULT_SUBNET_IPV4_VALUE } from 'src/utilities/subnets';

import type { CreateVPCPayload, VPC } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodeCreate/types';

// Custom hook to consolidate shared logic between VPCCreate.tsx and VPCCreateDrawer.tsx

// DON'T FORGET TO PUT BACK IN SENDING THE ANALYTICAL EVENT GIRL

export interface UseCreateVPCInputs {
  handleSelectVPC?: (vpc: VPC) => void;
  onDrawerClose?: () => void;
  pushToVPCPage?: boolean;
  selectedRegion?: string;
}

export const useCreateVPC = (inputs: UseCreateVPCInputs) => {
  const {
    handleSelectVPC,
    onDrawerClose,
    pushToVPCPage,
    selectedRegion,
  } = inputs;

  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const userCannotAddVPC = profile?.restricted && !grants?.global.add_vpcs;

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString(location.search);

  const { data: regions } = useRegionsQuery();
  const regionsData = regions ?? [];

  const {
    isPending: isLoadingCreateVPC,
    mutateAsync: createVPC,
  } = useCreateVPCMutation();

  const onCreateVPC = async (values: CreateVPCPayload) => {
    try {
      const vpc = await createVPC(values);
      if (pushToVPCPage) {
        history.push(`/vpcs/${vpc.id}`);
      } else {
        if (handleSelectVPC && onDrawerClose) {
          handleSelectVPC(vpc);
          onDrawerClose();
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
        form.setError(error?.field ?? 'root', { message: error.reason });
      }
    }
  };

  const form = useForm<CreateVPCPayload>({
    defaultValues: {
      description: '',
      label: '',
      region: selectedRegion ?? '',
      subnets: [
        {
          ipv4: DEFAULT_SUBNET_IPV4_VALUE,
          label: '',
        },
      ],
    },

    mode: 'onBlur',
    resolver: yupResolver(createVPCSchema),
  });

  return {
    form,
    isLoadingCreateVPC,
    onCreateVPC,
    regionsData,
    userCannotAddVPC,
  };
};
