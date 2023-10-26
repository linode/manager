import {
  APIError,
  CreateSubnetPayload,
  CreateVPCPayload,
} from '@linode/api-v4';
import { createVPCSchema } from '@linode/validation';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs';
import {
  SubnetError,
  handleVPCAndSubnetErrors,
} from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
} from 'src/utilities/subnets';

// Custom hook to consolidate shared logic between VPCCreate.tsx and VPCCreateDrawer.tsx

export interface UseCreateVPCInputs {
  handleSelectVPC?: (vpcId: number) => void;
  onDrawerClose?: () => void;
  pushToPage?: boolean;
  selectedRegion?: string;
}

export const useCreateVPC = (inputs: UseCreateVPCInputs) => {
  const { handleSelectVPC, onDrawerClose, pushToPage, selectedRegion } = inputs;

  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const userCannotAddVPC = profile?.restricted && !grants?.global.add_vpcs;

  const { data: regions } = useRegionsQuery();
  const regionsWithVPCCapability =
    regions?.filter((region) => region.capabilities.includes('VPCs')) ?? [];

  const [
    generalSubnetErrorsFromAPI,
    setGeneralSubnetErrorsFromAPI,
  ] = React.useState<APIError[]>();
  const [generalAPIError, setGeneralAPIError] = React.useState<
    string | undefined
  >();

  const {
    isLoading: isLoadingCreateVPC,
    mutateAsync: createVPC,
  } = useCreateVPCMutation();

  // When creating the subnet payloads, we also create a mapping of the indexes of the subnets that appear on
  // the UI to the indexes of the subnets that the API will receive. This enables users to leave subnets blank
  // on the UI and still have any errors returned by the API correspond to the correct subnet
  const createSubnetsPayloadAndMapping = () => {
    const subnetsPayload: CreateSubnetPayload[] = [];
    const subnetIdxMapping = {};
    let apiSubnetIdx = 0;

    for (let i = 0; i < formik.values.subnets.length; i++) {
      const { ip, label } = formik.values.subnets[i];
      if (ip.ipv4 || label) {
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
    errors: {},
    visualToAPISubnetMapping: {}
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
      const response = await createVPC(createVPCPayload);
      if (pushToPage) {
        history.push(`/vpcs/${response.id}`);
      } else {
        if (handleSelectVPC && onDrawerClose) {
          handleSelectVPC(response.id);
          onDrawerClose();
        }
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
    },
    onSubmit: onCreateVPC,
    validateOnChange: false,
    validationSchema: createVPCSchema,
  });

  // Helper method to set a field's value and clear existing errors
  const onChangeField = (field: string, value: string) => {
    formik.setFieldValue(field, value);
    if (formik.errors[field]) {
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
    regionsWithVPCCapability,
    setGeneralAPIError,
    setGeneralSubnetErrorsFromAPI,
    userCannotAddVPC,
  };
};
