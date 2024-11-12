import { createVPCSchema } from '@linode/validation';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs/vpcs';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { handleVPCAndSubnetErrors } from 'src/utilities/formikErrorUtils';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { DEFAULT_SUBNET_IPV4_VALUE } from 'src/utilities/subnets';

import type {
  APIError,
  CreateSubnetPayload,
  CreateVPCPayload,
  VPC,
} from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodeCreate/types';
import type { SubnetError } from 'src/utilities/formikErrorUtils';
import type { SubnetFieldState } from 'src/utilities/subnets';

// Custom hook to consolidate shared logic between VPCCreate.tsx and VPCCreateDrawer.tsx

export interface CreateVPCFieldState {
  description: string;
  label: string;
  region: string;
  subnets: SubnetFieldState[];
}

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

  const [
    generalSubnetErrorsFromAPI,
    setGeneralSubnetErrorsFromAPI,
  ] = React.useState<APIError[]>();
  const [generalAPIError, setGeneralAPIError] = React.useState<
    string | undefined
  >();

  const {
    isPending: isLoadingCreateVPC,
    mutateAsync: createVPC,
  } = useCreateVPCMutation();

  // When creating the subnet payloads, we also create a mapping of the indexes of the subnets that appear on
  // the UI to the indexes of the subnets that the API will receive. This enables users to leave subnets blank
  // on the UI and still have any errors returned by the API correspond to the correct subnet
  const createSubnetsPayloadAndMapping = () => {
    const subnetsPayload: CreateSubnetPayload[] = [];
    const subnetIdxMapping: Record<number, number> = {};
    let apiSubnetIdx = 0;

    for (let i = 0; i < formik.values.subnets.length; i++) {
      const { ip, label } = formik.values.subnets[i];
      // if we are inside the VPCCreateDrawer, we force the first subnet to always be included in the payload,
      // even if its fields are empty. This is for validation purposes - so that errors can be surfaced on the
      // first subnet's label and ipv4 field if applicable.
      if ((onDrawerClose && i === 0) || ip.ipv4 || label) {
        subnetsPayload.push({ ipv4: ip.ipv4, label });
        subnetIdxMapping[i] = apiSubnetIdx;
        apiSubnetIdx++;
      }
    }

    return {
      subnetsPayload,
      visualToAPISubnetMapping: subnetIdxMapping,
    };
  };

  const combineErrorsAndSubnets = (
    errors: Record<number, SubnetError>,
    visualToAPISubnetMapping: Record<number, number>
  ) => {
    return formik.values.subnets.map((subnet, idx) => {
      const apiSubnetIdx: number | undefined = visualToAPISubnetMapping[idx];
      // If the subnet has errors associated with it, include those errors in its state
      if ((apiSubnetIdx || apiSubnetIdx === 0) && errors[apiSubnetIdx]) {
        const errorData: SubnetError = errors[apiSubnetIdx];
        return {
          ...subnet,
          // @TODO VPC: IPv6 error handling
          ip: {
            ...subnet.ip,
            ipv4Error: errorData.ipv4 ?? '',
          },
          labelError: errorData.label ?? '',
        };
      } else {
        return subnet;
      }
    });
  };

  const onCreateVPC = async () => {
    formik.setSubmitting(true);
    setGeneralAPIError(undefined);

    const {
      subnetsPayload,
      visualToAPISubnetMapping,
    } = createSubnetsPayloadAndMapping();

    const createVPCPayload: CreateVPCPayload = {
      ...formik.values,
      subnets: subnetsPayload,
    };

    try {
      const vpc = await createVPC(createVPCPayload);
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
      const generalSubnetErrors = errors.filter(
        (error: APIError) =>
          // Both general and specific subnet errors include 'subnets' in their error field.
          // General subnet errors come in as { field: subnets.some_field, ...}, whereas
          // specific subnet errors come in as { field: subnets[some_index].some_field, ...}. So,
          // to avoid specific subnet errors, we filter out errors with a field that includes '['
          error.field &&
          error.field.includes('subnets') &&
          !error.field.includes('[')
      );

      if (generalSubnetErrors) {
        setGeneralSubnetErrorsFromAPI(generalSubnetErrors);
      }
      const indivSubnetErrors = handleVPCAndSubnetErrors(
        errors.filter(
          // ignore general subnet errors: !(the logic of filtering for only general subnet errors)
          (error: APIError) =>
            !error.field?.includes('subnets') ||
            !error.field ||
            error.field.includes('[')
        ),
        formik.setFieldError,
        setGeneralAPIError
      );

      // must combine errors and subnet data to avoid indexing weirdness when deleting a subnet
      const subnetsAndErrors = combineErrorsAndSubnets(
        indivSubnetErrors,
        visualToAPISubnetMapping
      );
      formik.setFieldValue('subnets', subnetsAndErrors);

      scrollErrorIntoView();
    }

    formik.setSubmitting(false);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      description: '',
      label: '',
      region: selectedRegion ?? '',
      subnets: [
        {
          ip: {
            availIPv4s: 256,
            ipv4: DEFAULT_SUBNET_IPV4_VALUE,
            ipv4Error: '',
          },
          label: '',
          labelError: '',
        },
      ] as SubnetFieldState[],
    } as CreateVPCFieldState,
    onSubmit: onCreateVPC,
    validateOnChange: false,
    validationSchema: createVPCSchema,
  });

  // Helper method to set a field's value and clear existing errors
  const onChangeField = (field: string, value: string) => {
    formik.setFieldValue(field, value);
    if (formik.errors[field as keyof CreateVPCFieldState]) {
      formik.setFieldError(field, undefined);
    }
  };

  return {
    formik,
    generalAPIError,
    generalSubnetErrorsFromAPI,
    isLoadingCreateVPC,
    onChangeField,
    onCreateVPC,
    regionsData,
    setGeneralAPIError,
    setGeneralSubnetErrorsFromAPI,
    userCannotAddVPC,
  };
};
